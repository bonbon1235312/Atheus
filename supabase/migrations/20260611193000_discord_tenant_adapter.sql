alter table public.discord_jobs
  add column if not exists available_at timestamptz not null default now(),
  add column if not exists claimed_by text,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists max_attempts integer not null default 5
    check (max_attempts between 1 and 20),
  add column if not exists cancelled_at timestamptz;

create index if not exists discord_jobs_available_queue_idx
  on public.discord_jobs (status, available_at, created_at)
  where status in ('pending', 'failed', 'claimed');

create table if not exists public.discord_guild_setups (
  league_id uuid not null references public.leagues(id) on delete cascade,
  discord_guild_id text not null,
  category_id text,
  channel_ids jsonb not null default '{}'::jsonb,
  setup_message_channel_id text,
  setup_message_id text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (league_id, discord_guild_id),
  constraint discord_guild_setup_guild_not_blank
    check (btrim(discord_guild_id) <> ''),
  constraint discord_guild_setup_channel_ids_object
    check (jsonb_typeof(channel_ids) = 'object')
);

drop trigger if exists discord_guild_setups_set_updated_at
  on public.discord_guild_setups;
create trigger discord_guild_setups_set_updated_at
before update on public.discord_guild_setups
for each row execute function public.atheus_set_updated_at();

alter table public.discord_guild_setups enable row level security;
revoke all on public.discord_guild_setups from anon, authenticated;

create unique index if not exists teams_active_discord_guild_uidx
  on public.teams (discord_guild_id)
  where discord_guild_id is not null and status = 'active';

create or replace function public.atheus_resolve_discord_guild(
  p_discord_guild_id text
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with guild_mapping as (
    select guild.league_id, guild.discord_guild_id
    from public.league_discord_guilds guild
    where guild.discord_guild_id = btrim(p_discord_guild_id)
      and guild.unlinked_at is null

    union

    select team.league_id, team.discord_guild_id
    from public.teams team
    where team.discord_guild_id = btrim(p_discord_guild_id)
      and team.status = 'active'
  )
  select jsonb_build_object(
    'league_id', l.id,
    'slug', l.slug,
    'name', l.name,
    'short_name', l.short_name,
    'status', l.status,
    'timezone', l.timezone,
    'discord_guild_id', guild.discord_guild_id,
    'season_id', season.id,
    'season_name', season.name,
    'team_id', team.id,
    'team_name', team.name,
    'website_url', null,
    'branding', jsonb_build_object(
      'logo_url', branding.logo_url,
      'primary_colour', branding.primary_colour,
      'secondary_colour', branding.secondary_colour,
      'accent_colour', branding.accent_colour,
      'background_colour', branding.background_colour,
      'surface_colour', branding.surface_colour,
      'text_colour', branding.text_colour,
      'muted_text_colour', branding.muted_text_colour
    ),
    'settings', jsonb_build_object(
      'review_mode', settings.review_mode,
      'collector_enabled', settings.collector_enabled,
      'public_stats_enabled', settings.public_stats_enabled,
      'points_for_win', settings.points_for_win,
      'points_for_draw', settings.points_for_draw,
      'points_for_loss', settings.points_for_loss
    )
  )
  from guild_mapping guild
  join public.leagues l
    on l.id = guild.league_id
    and l.status in ('draft', 'active')
  join public.league_branding branding on branding.league_id = l.id
  join public.league_settings settings on settings.league_id = l.id
  left join lateral (
    select s.id, s.name
    from public.seasons s
    where s.league_id = l.id
    order by
      case s.status when 'active' then 0 when 'draft' then 1 else 2 end,
      s.starts_on desc nulls last,
      s.created_at desc
    limit 1
  ) season on true
  left join lateral (
    select t.id, t.name
    from public.teams t
    where t.league_id = l.id
      and t.discord_guild_id = guild.discord_guild_id
      and t.status = 'active'
    order by t.created_at
    limit 1
  ) team on true
  limit 1;
$$;

create or replace function public.atheus_claim_discord_jobs(
  p_worker_id text,
  p_limit integer default 10,
  p_lease_seconds integer default 120
)
returns setof public.discord_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  if btrim(coalesce(p_worker_id, '')) = '' then
    raise exception 'worker id is required';
  end if;

  return query
  with candidates as (
    select jobs.id
    from public.discord_jobs jobs
    where jobs.attempts < jobs.max_attempts
      and (
        (
          jobs.status in ('pending', 'failed')
          and jobs.available_at <= now()
        )
        or (
          jobs.status = 'claimed'
          and jobs.lease_expires_at < now()
        )
      )
    order by jobs.available_at, jobs.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 10), 50))
  )
  update public.discord_jobs jobs
  set
    status = 'claimed',
    attempts = jobs.attempts + 1,
    claimed_at = now(),
    claimed_by = btrim(p_worker_id),
    lease_expires_at = now()
      + make_interval(secs => greatest(30, least(coalesce(p_lease_seconds, 120), 900))),
    last_error = null,
    updated_at = now()
  from candidates
  where jobs.id = candidates.id
  returning jobs.*;
end;
$$;

create or replace function public.atheus_complete_discord_job(
  p_job_id uuid,
  p_worker_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.discord_jobs
  set
    status = 'completed',
    completed_at = now(),
    lease_expires_at = null,
    last_error = null,
    updated_at = now()
  where id = p_job_id
    and status = 'claimed'
    and claimed_by = btrim(p_worker_id);

  return found;
end;
$$;

create or replace function public.atheus_fail_discord_job(
  p_job_id uuid,
  p_worker_id text,
  p_error text,
  p_retry_seconds integer default 60
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  update public.discord_jobs
  set
    status = case when attempts >= max_attempts then 'cancelled' else 'failed' end,
    available_at = now()
      + make_interval(secs => greatest(15, least(coalesce(p_retry_seconds, 60), 3600))),
    lease_expires_at = null,
    cancelled_at = case when attempts >= max_attempts then now() else cancelled_at end,
    last_error = left(coalesce(p_error, 'Unknown Discord job failure'), 2000),
    updated_at = now()
  where id = p_job_id
    and status = 'claimed'
    and claimed_by = btrim(p_worker_id)
  returning status into v_status;

  return v_status;
end;
$$;

create or replace function public.atheus_record_discord_guild_setup(
  p_league_id uuid,
  p_discord_guild_id text,
  p_category_id text,
  p_channel_ids jsonb,
  p_setup_message_channel_id text default null,
  p_setup_message_id text default null,
  p_complete boolean default false
)
returns public.discord_guild_setups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.discord_guild_setups;
begin
  if not (
    exists (
      select 1
      from public.league_discord_guilds
      where league_id = p_league_id
        and discord_guild_id = btrim(p_discord_guild_id)
        and unlinked_at is null
    )
    or exists (
      select 1
      from public.teams
      where league_id = p_league_id
        and discord_guild_id = btrim(p_discord_guild_id)
        and status = 'active'
    )
  ) then
    raise exception 'guild is not actively linked to league';
  end if;

  insert into public.discord_guild_setups (
    league_id,
    discord_guild_id,
    category_id,
    channel_ids,
    setup_message_channel_id,
    setup_message_id,
    completed_at
  )
  values (
    p_league_id,
    btrim(p_discord_guild_id),
    nullif(btrim(coalesce(p_category_id, '')), ''),
    coalesce(p_channel_ids, '{}'::jsonb),
    nullif(btrim(coalesce(p_setup_message_channel_id, '')), ''),
    nullif(btrim(coalesce(p_setup_message_id, '')), ''),
    case when p_complete then now() else null end
  )
  on conflict (league_id, discord_guild_id) do update
  set
    category_id = coalesce(excluded.category_id, discord_guild_setups.category_id),
    channel_ids = discord_guild_setups.channel_ids || excluded.channel_ids,
    setup_message_channel_id = coalesce(
      excluded.setup_message_channel_id,
      discord_guild_setups.setup_message_channel_id
    ),
    setup_message_id = coalesce(
      excluded.setup_message_id,
      discord_guild_setups.setup_message_id
    ),
    completed_at = case
      when p_complete then coalesce(discord_guild_setups.completed_at, now())
      else discord_guild_setups.completed_at
    end,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.atheus_resolve_discord_guild(text)
  from public, anon, authenticated;
revoke all on function public.atheus_claim_discord_jobs(text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.atheus_complete_discord_job(uuid, text)
  from public, anon, authenticated;
revoke all on function public.atheus_fail_discord_job(uuid, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.atheus_record_discord_guild_setup(
  uuid, text, text, jsonb, text, text, boolean
) from public, anon, authenticated;

grant execute on function public.atheus_resolve_discord_guild(text)
  to service_role;
grant execute on function public.atheus_claim_discord_jobs(text, integer, integer)
  to service_role;
grant execute on function public.atheus_complete_discord_job(uuid, text)
  to service_role;
grant execute on function public.atheus_fail_discord_job(uuid, text, text, integer)
  to service_role;
grant execute on function public.atheus_record_discord_guild_setup(
  uuid, text, text, jsonb, text, text, boolean
) to service_role;

comment on table public.discord_guild_setups is
  'Idempotency state for Atheus-owned Discord categories, channels, and setup messages.';

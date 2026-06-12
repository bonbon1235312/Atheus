begin;

create table if not exists public.platform_entitlements (
  discord_user_id text primary key,
  plan text not null default 'free'
    check (plan in ('free', 'premium', 'grandfathered')),
  premium_status text not null default 'none'
    check (premium_status in ('none', 'trialing', 'active', 'past_due', 'cancelled')),
  premium_current_period_end timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  free_claimed_at timestamptz,
  free_league_id uuid,
  creation_blocked_at timestamptz,
  creation_block_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_entitlement_user_not_blank
    check (btrim(discord_user_id) <> ''),
  constraint platform_entitlement_claim_consistent
    check (
      (free_claimed_at is null and free_league_id is null)
      or
      (free_claimed_at is not null and free_league_id is not null)
    )
);

create table if not exists public.league_creation_signals (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  league_id uuid references public.leagues(id) on delete set null,
  discord_guild_id text not null,
  discord_account_created_at timestamptz not null,
  discord_guild_created_at timestamptz not null,
  guild_member_count integer check (guild_member_count is null or guild_member_count >= 0),
  ip_hash text,
  user_agent_hash text,
  risk_flags jsonb not null default '[]'::jsonb,
  decision text not null check (decision in ('allowed', 'blocked')),
  created_at timestamptz not null default now(),
  constraint league_creation_signal_user_not_blank
    check (btrim(discord_user_id) <> ''),
  constraint league_creation_signal_guild_not_blank
    check (btrim(discord_guild_id) <> '')
);

create index if not exists league_creation_signals_user_idx
  on public.league_creation_signals (discord_user_id, created_at desc);

create index if not exists league_creation_signals_ip_idx
  on public.league_creation_signals (ip_hash, created_at desc)
  where ip_hash is not null;

create index if not exists league_creation_signals_device_idx
  on public.league_creation_signals (ip_hash, user_agent_hash, created_at desc)
  where ip_hash is not null and user_agent_hash is not null;

alter table public.league_discord_guilds
  add column if not exists ownership_verified_at timestamptz,
  add column if not exists bot_verified_at timestamptz,
  add column if not exists guild_member_count integer
    check (guild_member_count is null or guild_member_count >= 0);

insert into public.platform_entitlements (
  discord_user_id,
  plan,
  free_claimed_at,
  free_league_id
)
select
  created_by_discord_user_id,
  case when count(*) > 1 then 'grandfathered' else 'free' end,
  min(created_at),
  (array_agg(id order by created_at))[1]
from public.leagues
group by created_by_discord_user_id
on conflict (discord_user_id) do nothing;

drop function if exists public.create_league_onboarding(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
);

create or replace function public.create_league_onboarding(
  p_name text,
  p_slug text,
  p_short_name text,
  p_description text,
  p_timezone text,
  p_platform text,
  p_discord_guild_id text,
  p_discord_user_id text,
  p_primary_colour text,
  p_secondary_colour text,
  p_accent_colour text,
  p_owner_verified boolean,
  p_discord_account_created_at timestamptz,
  p_discord_guild_created_at timestamptz,
  p_guild_member_count integer,
  p_minimum_guild_members integer,
  p_ip_hash text,
  p_user_agent_hash text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league_id uuid;
  v_entitlement public.platform_entitlements%rowtype;
  v_has_premium boolean;
  v_risk_flags jsonb := '[]'::jsonb;
begin
  if btrim(coalesce(p_name, '')) = '' then
    raise exception 'League name is required.';
  end if;

  if coalesce(p_slug, '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'League slug is invalid.';
  end if;

  if btrim(coalesce(p_discord_guild_id, '')) = ''
    or btrim(coalesce(p_discord_user_id, '')) = '' then
    raise exception 'Discord identity is required.';
  end if;

  if not exists (
    select 1 from pg_timezone_names where name = p_timezone
  ) then
    raise exception 'Timezone is invalid.';
  end if;

  insert into public.platform_entitlements (discord_user_id)
  values (p_discord_user_id)
  on conflict (discord_user_id) do nothing;

  select *
  into v_entitlement
  from public.platform_entitlements
  where discord_user_id = p_discord_user_id
  for update;

  if v_entitlement.creation_blocked_at is not null then
    raise exception 'League creation is blocked for this account. Contact Atheus support.';
  end if;

  v_has_premium :=
    v_entitlement.plan = 'grandfathered'
    or (
      v_entitlement.plan = 'premium'
      and v_entitlement.premium_status in ('trialing', 'active')
      and (
        v_entitlement.premium_current_period_end is null
        or v_entitlement.premium_current_period_end > now()
      )
    );

  if not v_has_premium then
    if v_entitlement.free_claimed_at is not null then
      raise exception 'This Discord account has already used its lifetime free league.';
    end if;

    if not coalesce(p_owner_verified, false) then
      raise exception 'Free leagues must be created by the Discord server owner.';
    end if;

    if p_discord_account_created_at > now() - interval '30 days' then
      raise exception 'Discord accounts must be at least 30 days old to create a free league.';
    end if;

    if p_discord_guild_created_at > now() - interval '30 days' then
      raise exception 'Discord servers must be at least 30 days old to host a free league.';
    end if;

    if coalesce(p_minimum_guild_members, 0) > 0
      and coalesce(p_guild_member_count, -1) < p_minimum_guild_members then
      raise exception 'This Discord server does not meet the minimum member requirement.';
    end if;
  end if;

  if p_ip_hash is not null and (
    select count(distinct discord_user_id)
    from public.league_creation_signals
    where ip_hash = p_ip_hash
      and created_at > now() - interval '90 days'
      and discord_user_id <> p_discord_user_id
  ) >= 2 then
    v_risk_flags := v_risk_flags || '["shared_network_multiple_accounts"]'::jsonb;
  end if;

  if p_ip_hash is not null and p_user_agent_hash is not null and (
    select count(distinct discord_user_id)
    from public.league_creation_signals
    where ip_hash = p_ip_hash
      and user_agent_hash = p_user_agent_hash
      and created_at > now() - interval '90 days'
      and discord_user_id <> p_discord_user_id
  ) >= 1 then
    v_risk_flags := v_risk_flags || '["repeated_device_pattern"]'::jsonb;
  end if;

  insert into public.leagues (
    name,
    slug,
    short_name,
    description,
    timezone,
    default_platform,
    created_by_discord_user_id
  )
  values (
    btrim(p_name),
    p_slug,
    nullif(btrim(coalesce(p_short_name, '')), ''),
    nullif(btrim(coalesce(p_description, '')), ''),
    p_timezone,
    p_platform,
    p_discord_user_id
  )
  returning id into v_league_id;

  insert into public.league_discord_guilds (
    league_id,
    discord_guild_id,
    is_primary,
    linked_by_discord_user_id,
    ownership_verified_at,
    bot_verified_at,
    guild_member_count
  )
  values (
    v_league_id,
    p_discord_guild_id,
    true,
    p_discord_user_id,
    case when p_owner_verified then now() else null end,
    now(),
    p_guild_member_count
  );

  update public.league_branding
  set primary_colour = upper(p_primary_colour),
      secondary_colour = upper(p_secondary_colour),
      accent_colour = upper(p_accent_colour),
      updated_at = now()
  where league_id = v_league_id;

  if not v_has_premium then
    update public.platform_entitlements
    set free_claimed_at = now(),
        free_league_id = v_league_id,
        updated_at = now()
    where discord_user_id = p_discord_user_id;
  end if;

  insert into public.league_creation_signals (
    discord_user_id,
    league_id,
    discord_guild_id,
    discord_account_created_at,
    discord_guild_created_at,
    guild_member_count,
    ip_hash,
    user_agent_hash,
    risk_flags,
    decision
  )
  values (
    p_discord_user_id,
    v_league_id,
    p_discord_guild_id,
    p_discord_account_created_at,
    p_discord_guild_created_at,
    p_guild_member_count,
    p_ip_hash,
    p_user_agent_hash,
    v_risk_flags,
    'allowed'
  );

  insert into public.audit_logs (
    league_id,
    actor_discord_user_id,
    action,
    entity_type,
    entity_id,
    after_data
  )
  values (
    v_league_id,
    p_discord_user_id,
    'league.created',
    'league',
    v_league_id,
    jsonb_build_object(
      'name', btrim(p_name),
      'slug', p_slug,
      'discord_guild_id', p_discord_guild_id,
      'entitlement_plan', v_entitlement.plan,
      'risk_flags', v_risk_flags
    )
  );

  return v_league_id;
end;
$$;

create or replace function public.activate_league(
  p_league_id uuid,
  p_discord_user_id text,
  p_discord_guild_id text,
  p_owner_verified boolean,
  p_bot_verified boolean,
  p_guild_member_count integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league public.leagues%rowtype;
  v_team_count integer;
  v_linked_team_count integer;
  v_season_count integer;
  v_slot_count integer;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role = 'owner'
  ) then
    raise exception 'Only the league owner can activate this league.';
  end if;

  select * into v_league
  from public.leagues
  where id = p_league_id
  for update;

  if v_league.id is null then
    raise exception 'League not found.';
  end if;

  if v_league.status = 'active' then
    return jsonb_build_object('status', 'active', 'already_active', true);
  end if;

  if not coalesce(p_owner_verified, false) then
    raise exception 'The league owner must still own the linked Discord server.';
  end if;

  if not coalesce(p_bot_verified, false) then
    raise exception 'The Atheus bot must be installed in the linked Discord server.';
  end if;

  if not exists (
    select 1
    from public.league_discord_guilds
    where league_id = p_league_id
      and discord_guild_id = p_discord_guild_id
      and is_primary
      and unlinked_at is null
  ) then
    raise exception 'The primary Discord server binding is invalid.';
  end if;

  select count(*) into v_season_count
  from public.seasons
  where league_id = p_league_id and status in ('draft', 'active');

  select count(*) into v_slot_count
  from public.league_schedule_slots
  where league_id = p_league_id and active;

  select count(*) into v_team_count
  from public.teams
  where league_id = p_league_id and status = 'active';

  select count(distinct team_id) into v_linked_team_count
  from public.team_ea_club_links
  where league_id = p_league_id and inactive_at is null;

  if v_season_count = 0 then
    raise exception 'Create a season before activation.';
  end if;

  if v_slot_count = 0 then
    raise exception 'Add at least one active match window before activation.';
  end if;

  if v_team_count < 2 then
    raise exception 'Add at least two active teams before activation.';
  end if;

  if v_linked_team_count <> v_team_count then
    raise exception 'Every active team needs an active EA club link before activation.';
  end if;

  update public.league_discord_guilds
  set ownership_verified_at = now(),
      bot_verified_at = now(),
      guild_member_count = p_guild_member_count
  where league_id = p_league_id
    and discord_guild_id = p_discord_guild_id
    and unlinked_at is null;

  update public.seasons
  set status = 'active', updated_at = now()
  where id = (
    select id
    from public.seasons
    where league_id = p_league_id and status = 'draft'
    order by created_at
    limit 1
  );

  update public.leagues
  set status = 'active',
      activated_at = coalesce(activated_at, now()),
      updated_at = now()
  where id = p_league_id;

  insert into public.audit_logs (
    league_id,
    actor_discord_user_id,
    action,
    entity_type,
    entity_id,
    after_data
  )
  values (
    p_league_id,
    p_discord_user_id,
    'league.activated',
    'league',
    p_league_id,
    jsonb_build_object(
      'discord_guild_id', p_discord_guild_id,
      'team_count', v_team_count,
      'linked_team_count', v_linked_team_count,
      'schedule_slot_count', v_slot_count
    )
  );

  return jsonb_build_object(
    'status', 'active',
    'team_count', v_team_count,
    'linked_team_count', v_linked_team_count,
    'schedule_slot_count', v_slot_count
  );
end;
$$;

alter table public.platform_entitlements enable row level security;
alter table public.league_creation_signals enable row level security;

revoke all on public.platform_entitlements from anon, authenticated;
revoke all on public.league_creation_signals from anon, authenticated;

revoke all on function public.create_league_onboarding(
  text, text, text, text, text, text, text, text, text, text, text,
  boolean, timestamptz, timestamptz, integer, integer, text, text
) from public, anon, authenticated;

grant execute on function public.create_league_onboarding(
  text, text, text, text, text, text, text, text, text, text, text,
  boolean, timestamptz, timestamptz, integer, integer, text, text
) to service_role;

revoke all on function public.activate_league(
  uuid, text, text, boolean, boolean, integer
) from public, anon, authenticated;

grant execute on function public.activate_league(
  uuid, text, text, boolean, boolean, integer
) to service_role;

comment on table public.platform_entitlements is
  'Platform-controlled free and premium league creation entitlement. A free claim is permanent.';
comment on table public.league_creation_signals is
  'Privacy-reduced abuse signals. Raw IP addresses and full user agents are not stored.';

commit;

begin;

-- Teams assigned to specific competitions/divisions within a season.
-- A team can appear in multiple competitions (e.g. league + cup) and a
-- competition can have many teams. This table is the admin-facing roster for
-- each division; the public standings are still derived from actual match data.
create table if not exists public.competition_teams (
  id             uuid        primary key default gen_random_uuid(),
  league_id      uuid        not null references public.leagues(id)      on delete cascade,
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  team_id        uuid        not null references public.teams(id)        on delete cascade,
  created_at     timestamptz not null default now(),
  unique(competition_id, team_id)
);

create index competition_teams_league_id_idx      on public.competition_teams(league_id);
create index competition_teams_competition_id_idx on public.competition_teams(competition_id);
create index competition_teams_team_id_idx        on public.competition_teams(team_id);

alter table public.competition_teams enable row level security;

-- Only the service_role (used by Next.js server) may read or write this table.
revoke all on public.competition_teams from public, anon, authenticated;
grant all on public.competition_teams to service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- create_division
-- Creates a new league-kind competition for the given season.
-- The season_id scopes the division so operators can have D1/D2 per season.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.create_division(
  p_league_id      uuid,
  p_season_id      uuid,
  p_discord_user_id text,
  p_name           text,
  p_slug           text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_competition_id uuid;
begin
  if not exists (
    select 1 from public.league_memberships
    where league_id      = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin')
  ) then
    raise exception 'League owner or admin access is required.';
  end if;

  if not exists (
    select 1 from public.seasons
    where id = p_season_id and league_id = p_league_id
  ) then
    raise exception 'Season not found in this league.';
  end if;

  if btrim(coalesce(p_name, '')) = '' then
    raise exception 'Division name is required.';
  end if;

  if coalesce(p_slug, '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Division slug must only contain lowercase letters, numbers and hyphens.';
  end if;

  insert into public.competitions (
    league_id, season_id, name, slug, kind, active
  ) values (
    p_league_id, p_season_id, btrim(p_name), p_slug, 'league', true
  )
  returning id into v_competition_id;

  insert into public.audit_logs (
    league_id, actor_discord_user_id, action, entity_type, entity_id, after_data
  ) values (
    p_league_id, p_discord_user_id, 'division.created', 'competition', v_competition_id,
    jsonb_build_object('name', p_name, 'slug', p_slug, 'season_id', p_season_id)
  );

  return v_competition_id;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- rename_division
-- Updates the display name of an existing league-kind competition.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.rename_division(
  p_league_id       uuid,
  p_competition_id  uuid,
  p_discord_user_id text,
  p_name            text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.league_memberships
    where league_id      = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin')
  ) then
    raise exception 'League owner or admin access is required.';
  end if;

  if btrim(coalesce(p_name, '')) = '' then
    raise exception 'Division name is required.';
  end if;

  update public.competitions
  set name       = btrim(p_name),
      updated_at = now()
  where id         = p_competition_id
    and league_id  = p_league_id
    and kind       = 'league';

  if not found then
    raise exception 'Division not found in this league.';
  end if;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- add_team_to_division
-- Assigns a team to a division (league-kind competition).
-- Idempotent: re-adding an already-assigned team is a no-op.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.add_team_to_division(
  p_league_id       uuid,
  p_competition_id  uuid,
  p_team_id         uuid,
  p_discord_user_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.league_memberships
    where league_id      = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin')
  ) then
    raise exception 'League owner or admin access is required.';
  end if;

  if not exists (
    select 1 from public.competitions
    where id         = p_competition_id
      and league_id  = p_league_id
      and kind       = 'league'
      and active
  ) then
    raise exception 'Division not found in this league.';
  end if;

  if not exists (
    select 1 from public.teams
    where id        = p_team_id
      and league_id = p_league_id
      and status    = 'active'
  ) then
    raise exception 'Team not found or inactive in this league.';
  end if;

  insert into public.competition_teams (league_id, competition_id, team_id)
  values (p_league_id, p_competition_id, p_team_id)
  on conflict (competition_id, team_id) do nothing;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- remove_team_from_division
-- Unassigns a team from a division.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.remove_team_from_division(
  p_league_id       uuid,
  p_competition_id  uuid,
  p_team_id         uuid,
  p_discord_user_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.league_memberships
    where league_id      = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin')
  ) then
    raise exception 'League owner or admin access is required.';
  end if;

  delete from public.competition_teams
  where league_id      = p_league_id
    and competition_id = p_competition_id
    and team_id        = p_team_id;
end;
$$;

-- Grant service_role execute on all new functions; revoke from all others.
revoke all on function public.create_division(uuid, uuid, text, text, text)        from public, anon, authenticated;
grant execute on function public.create_division(uuid, uuid, text, text, text)     to service_role;

revoke all on function public.rename_division(uuid, uuid, text, text)              from public, anon, authenticated;
grant execute on function public.rename_division(uuid, uuid, text, text)           to service_role;

revoke all on function public.add_team_to_division(uuid, uuid, uuid, text)        from public, anon, authenticated;
grant execute on function public.add_team_to_division(uuid, uuid, uuid, text)     to service_role;

revoke all on function public.remove_team_from_division(uuid, uuid, uuid, text)   from public, anon, authenticated;
grant execute on function public.remove_team_from_division(uuid, uuid, uuid, text) to service_role;

commit;

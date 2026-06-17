begin;

-- ────────────────────────────────────────────────────────────────────────────
-- replace_league_team (revised)
--
-- Adds division-roster carry-over to the existing team replacement flow. When a
-- team is swapped out, its competition_teams assignments for the affected season
-- now move to the incoming team in the same transaction, so admin division
-- rosters and the fixture generator's auto-select stay in sync after a swap.
--
-- Everything else is unchanged from 20260613102908. competition_teams was added
-- later (20260616000000), so the original function predated it.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.replace_league_team(
  p_league_id uuid,
  p_season_id uuid,
  p_outgoing_team_id uuid,
  p_incoming_team_id uuid,
  p_discord_user_id text,
  p_effective_at timestamptz,
  p_transfer_future_fixtures boolean default true,
  p_transfer_table_record boolean default true,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_outgoing public.teams%rowtype;
  v_incoming public.teams%rowtype;
  v_fixture_count integer := 0;
  v_closed_link_count integer := 0;
  v_division_count integer := 0;
  v_replacement_id uuid;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin')
  ) then
    raise exception 'League owner or admin access is required.';
  end if;

  if p_outgoing_team_id = p_incoming_team_id then
    raise exception 'Choose two different teams.';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'A replacement reason is required.';
  end if;

  if p_effective_at is null then
    raise exception 'An effective time is required.';
  end if;

  if p_effective_at > now() + interval '5 minutes' then
    raise exception 'Team replacement is an immediate operation. The effective time cannot be in the future.';
  end if;

  if not exists (
    select 1
    from public.seasons
    where id = p_season_id
      and league_id = p_league_id
      and status in ('draft', 'active')
  ) then
    raise exception 'The selected season is not available for replacement.';
  end if;

  select * into v_outgoing
  from public.teams
  where id = p_outgoing_team_id
    and league_id = p_league_id
  for update;

  select * into v_incoming
  from public.teams
  where id = p_incoming_team_id
    and league_id = p_league_id
  for update;

  if v_outgoing.id is null or v_incoming.id is null then
    raise exception 'Both teams must belong to this league.';
  end if;

  if v_outgoing.status <> 'active' then
    raise exception 'The outgoing team must currently be active.';
  end if;

  if v_incoming.status not in ('active', 'inactive') then
    raise exception 'The incoming team has already been replaced or withdrawn.';
  end if;

  if exists (
    with recursive successors as (
      select incoming_team_id
      from public.team_replacements
      where league_id = p_league_id
        and season_id = p_season_id
        and outgoing_team_id = p_incoming_team_id

      union

      select replacement.incoming_team_id
      from successors
      join public.team_replacements replacement
        on replacement.league_id = p_league_id
        and replacement.season_id = p_season_id
        and replacement.outgoing_team_id = successors.incoming_team_id
    )
    select 1
    from successors
    where incoming_team_id = p_outgoing_team_id
  ) then
    raise exception 'This replacement would create a circular team history.';
  end if;

  if not exists (
    select 1
    from public.team_ea_club_links
    where league_id = p_league_id
      and team_id = p_incoming_team_id
      and inactive_at is null
  ) then
    raise exception 'Link the incoming team to its EA club before replacing the outgoing team.';
  end if;

  if p_transfer_future_fixtures and exists (
    select 1
    from public.fixtures
    where league_id = p_league_id
      and season_id = p_season_id
      and kickoff_at >= p_effective_at
      and status in ('scheduled', 'postponed')
      and (
        (home_team_id = p_outgoing_team_id and away_team_id = p_incoming_team_id)
        or
        (away_team_id = p_outgoing_team_id and home_team_id = p_incoming_team_id)
      )
  ) then
    raise exception 'A future fixture already pairs the outgoing and incoming teams. Resolve it first.';
  end if;

  if p_transfer_future_fixtures and exists (
    select 1
    from public.fixtures outgoing_fixture
    join public.fixtures incoming_fixture
      on incoming_fixture.league_id = outgoing_fixture.league_id
      and incoming_fixture.season_id = outgoing_fixture.season_id
      and incoming_fixture.kickoff_at = outgoing_fixture.kickoff_at
      and incoming_fixture.id <> outgoing_fixture.id
      and incoming_fixture.status in ('scheduled', 'postponed')
      and (
        incoming_fixture.home_team_id = p_incoming_team_id
        or incoming_fixture.away_team_id = p_incoming_team_id
      )
    where outgoing_fixture.league_id = p_league_id
      and outgoing_fixture.season_id = p_season_id
      and outgoing_fixture.kickoff_at >= p_effective_at
      and outgoing_fixture.status in ('scheduled', 'postponed')
      and (
        outgoing_fixture.home_team_id = p_outgoing_team_id
        or outgoing_fixture.away_team_id = p_outgoing_team_id
      )
  ) then
    raise exception 'The incoming team already has a fixture at one of the outgoing team''s kickoff times.';
  end if;

  insert into public.team_replacements (
    league_id,
    season_id,
    outgoing_team_id,
    incoming_team_id,
    effective_at,
    transfer_fixture_ownership,
    transfer_table_record,
    reason,
    approved_by_discord_user_id
  )
  values (
    p_league_id,
    p_season_id,
    p_outgoing_team_id,
    p_incoming_team_id,
    p_effective_at,
    coalesce(p_transfer_future_fixtures, true),
    coalesce(p_transfer_table_record, true),
    btrim(p_reason),
    p_discord_user_id
  )
  returning id into v_replacement_id;

  if p_transfer_future_fixtures then
    update public.fixtures
    set home_team_id = case
          when home_team_id = p_outgoing_team_id then p_incoming_team_id
          else home_team_id
        end,
        away_team_id = case
          when away_team_id = p_outgoing_team_id then p_incoming_team_id
          else away_team_id
        end,
        result_note = concat_ws(
          ' / ',
          nullif(result_note, ''),
          'Team replacement: ' || v_outgoing.name || ' -> ' || v_incoming.name
        ),
        updated_at = now()
    where league_id = p_league_id
      and season_id = p_season_id
      and kickoff_at >= p_effective_at
      and status in ('scheduled', 'postponed')
      and (
        home_team_id = p_outgoing_team_id
        or away_team_id = p_outgoing_team_id
      );
    get diagnostics v_fixture_count = row_count;
  end if;

  update public.team_ea_club_links
  set inactive_at = greatest(active_from, p_effective_at)
  where league_id = p_league_id
    and team_id = p_outgoing_team_id
    and inactive_at is null;
  get diagnostics v_closed_link_count = row_count;

  update public.teams
  set status = 'replaced',
      updated_at = now()
  where id = p_outgoing_team_id;

  update public.teams
  set status = 'active',
      updated_at = now()
  where id = p_incoming_team_id;

  -- Carry the outgoing team's division rosters (for this season) to the incoming
  -- team. Guard against the unique(competition_id, team_id) constraint when the
  -- incoming team is already a member of one of those divisions; any rows that
  -- can't move because of that are dropped as duplicates immediately after.
  update public.competition_teams ct
  set team_id = p_incoming_team_id
  from public.competitions c
  where c.id = ct.competition_id
    and c.season_id = p_season_id
    and ct.league_id = p_league_id
    and ct.team_id = p_outgoing_team_id
    and not exists (
      select 1
      from public.competition_teams existing
      where existing.competition_id = ct.competition_id
        and existing.team_id = p_incoming_team_id
    );
  get diagnostics v_division_count = row_count;

  delete from public.competition_teams ct
  using public.competitions c
  where c.id = ct.competition_id
    and c.season_id = p_season_id
    and ct.league_id = p_league_id
    and ct.team_id = p_outgoing_team_id;

  insert into public.audit_logs (
    league_id,
    actor_discord_user_id,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data,
    reason
  )
  values (
    p_league_id,
    p_discord_user_id,
    'team.replaced',
    'team_replacement',
    v_replacement_id,
    jsonb_build_object(
      'outgoing_team_id', v_outgoing.id,
      'outgoing_team_name', v_outgoing.name,
      'outgoing_status', v_outgoing.status,
      'incoming_team_id', v_incoming.id,
      'incoming_team_name', v_incoming.name,
      'incoming_status', v_incoming.status
    ),
    jsonb_build_object(
      'effective_at', p_effective_at,
      'transferred_future_fixtures', v_fixture_count,
      'transfer_table_record', coalesce(p_transfer_table_record, true),
      'closed_ea_links', v_closed_link_count,
      'transferred_division_slots', v_division_count
    ),
    btrim(p_reason)
  );

  return jsonb_build_object(
    'replacement_id', v_replacement_id,
    'transferred_future_fixtures', v_fixture_count,
    'closed_ea_links', v_closed_link_count,
    'transferred_division_slots', v_division_count
  );
end;
$$;

commit;

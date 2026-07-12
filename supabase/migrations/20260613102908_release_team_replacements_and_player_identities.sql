begin;

create or replace function public.atheus_normalize_player_name(p_value text)
returns text
language sql
immutable
strict
set search_path = pg_catalog
as $$
  select regexp_replace(lower(btrim(p_value)), '[^a-z0-9]+', '', 'g');
$$;

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
      'closed_ea_links', v_closed_link_count
    ),
    btrim(p_reason)
  );

  return jsonb_build_object(
    'replacement_id', v_replacement_id,
    'transferred_future_fixtures', v_fixture_count,
    'closed_ea_links', v_closed_link_count
  );
end;
$$;

create or replace function public.update_player_identity(
  p_league_id uuid,
  p_player_identity_id uuid,
  p_discord_user_id text,
  p_canonical_name text,
  p_player_discord_user_id text default null,
  p_current_team_id uuid default null,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_identity public.player_identities%rowtype;
  v_normalized text;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin', 'reviewer')
  ) then
    raise exception 'Player identity access is required.';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'A correction reason is required.';
  end if;

  v_normalized := public.atheus_normalize_player_name(p_canonical_name);
  if v_normalized = '' then
    raise exception 'Enter a valid canonical gamertag.';
  end if;

  select * into v_identity
  from public.player_identities
  where id = p_player_identity_id
    and league_id = p_league_id
  for update;

  if v_identity.id is null then
    raise exception 'Player identity was not found.';
  end if;

  if p_current_team_id is not null and not exists (
    select 1 from public.teams
    where id = p_current_team_id and league_id = p_league_id
  ) then
    raise exception 'The selected team does not belong to this league.';
  end if;

  if exists (
    select 1
    from public.player_identities
    where league_id = p_league_id
      and normalized_name = v_normalized
      and id <> p_player_identity_id
  ) then
    raise exception 'Another player identity already uses that gamertag. Merge the identities instead.';
  end if;

  if exists (
    select 1
    from public.player_aliases
    where league_id = p_league_id
      and normalized_alias = v_normalized
      and player_identity_id <> p_player_identity_id
  ) then
    raise exception 'That gamertag is already an alias of another player.';
  end if;

  insert into public.player_aliases (
    league_id,
    player_identity_id,
    alias,
    normalized_alias,
    source
  )
  values (
    p_league_id,
    p_player_identity_id,
    v_identity.canonical_name,
    v_identity.normalized_name,
    'admin_correction'
  )
  on conflict (league_id, normalized_alias) do nothing;

  update public.player_identities
  set canonical_name = btrim(p_canonical_name),
      normalized_name = v_normalized,
      discord_user_id = nullif(btrim(coalesce(p_player_discord_user_id, '')), ''),
      current_team_id = p_current_team_id,
      updated_at = now()
  where id = p_player_identity_id;

  insert into public.player_aliases (
    league_id,
    player_identity_id,
    alias,
    normalized_alias,
    source
  )
  values (
    p_league_id,
    p_player_identity_id,
    btrim(p_canonical_name),
    v_normalized,
    'canonical'
  )
  on conflict (league_id, normalized_alias) do update
    set alias = excluded.alias,
        player_identity_id = excluded.player_identity_id,
        source = excluded.source;

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
    'player.identity_updated',
    'player_identity',
    p_player_identity_id,
    to_jsonb(v_identity),
    jsonb_build_object(
      'canonical_name', btrim(p_canonical_name),
      'normalized_name', v_normalized,
      'discord_user_id', nullif(btrim(coalesce(p_player_discord_user_id, '')), ''),
      'current_team_id', p_current_team_id
    ),
    btrim(p_reason)
  );

  return p_player_identity_id;
end;
$$;

create or replace function public.add_player_alias(
  p_league_id uuid,
  p_player_identity_id uuid,
  p_discord_user_id text,
  p_alias text,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_alias_id uuid;
  v_normalized text;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin', 'reviewer')
  ) then
    raise exception 'Player identity access is required.';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'A reason is required.';
  end if;

  if not exists (
    select 1 from public.player_identities
    where id = p_player_identity_id and league_id = p_league_id
  ) then
    raise exception 'Player identity was not found.';
  end if;

  v_normalized := public.atheus_normalize_player_name(p_alias);
  if v_normalized = '' then
    raise exception 'Enter a valid alias.';
  end if;

  if exists (
    select 1 from public.player_identities
    where league_id = p_league_id
      and normalized_name = v_normalized
      and id <> p_player_identity_id
  ) then
    raise exception 'That alias is the canonical name of another player.';
  end if;

  insert into public.player_aliases (
    league_id,
    player_identity_id,
    alias,
    normalized_alias,
    source
  )
  values (
    p_league_id,
    p_player_identity_id,
    btrim(p_alias),
    v_normalized,
    'admin'
  )
  returning id into v_alias_id;

  insert into public.audit_logs (
    league_id,
    actor_discord_user_id,
    action,
    entity_type,
    entity_id,
    after_data,
    reason
  )
  values (
    p_league_id,
    p_discord_user_id,
    'player.alias_added',
    'player_alias',
    v_alias_id,
    jsonb_build_object(
      'player_identity_id', p_player_identity_id,
      'alias', btrim(p_alias),
      'normalized_alias', v_normalized
    ),
    btrim(p_reason)
  );

  return v_alias_id;
end;
$$;

create or replace function public.remove_player_alias(
  p_league_id uuid,
  p_alias_id uuid,
  p_discord_user_id text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_alias public.player_aliases%rowtype;
  v_identity public.player_identities%rowtype;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin', 'reviewer')
  ) then
    raise exception 'Player identity access is required.';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'A reason is required.';
  end if;

  select * into v_alias
  from public.player_aliases
  where id = p_alias_id
    and league_id = p_league_id
  for update;

  if v_alias.id is null then
    raise exception 'Player alias was not found.';
  end if;

  select * into v_identity
  from public.player_identities
  where id = v_alias.player_identity_id
    and league_id = p_league_id;

  if v_alias.normalized_alias = v_identity.normalized_name then
    raise exception 'The canonical gamertag cannot be removed as an alias.';
  end if;

  delete from public.player_aliases where id = p_alias_id;

  insert into public.audit_logs (
    league_id,
    actor_discord_user_id,
    action,
    entity_type,
    entity_id,
    before_data,
    reason
  )
  values (
    p_league_id,
    p_discord_user_id,
    'player.alias_removed',
    'player_alias',
    p_alias_id,
    to_jsonb(v_alias),
    btrim(p_reason)
  );
end;
$$;

create or replace function public.merge_player_identities(
  p_league_id uuid,
  p_source_player_identity_id uuid,
  p_target_player_identity_id uuid,
  p_discord_user_id text,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_source public.player_identities%rowtype;
  v_target public.player_identities%rowtype;
  v_stat_rows integer := 0;
  v_alias_rows integer := 0;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin', 'reviewer')
  ) then
    raise exception 'Player identity access is required.';
  end if;

  if p_source_player_identity_id = p_target_player_identity_id then
    raise exception 'Choose two different player identities.';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'A merge reason is required.';
  end if;

  select * into v_source
  from public.player_identities
  where id = p_source_player_identity_id
    and league_id = p_league_id
  for update;

  select * into v_target
  from public.player_identities
  where id = p_target_player_identity_id
    and league_id = p_league_id
  for update;

  if v_source.id is null or v_target.id is null then
    raise exception 'Both player identities must belong to this league.';
  end if;

  if v_source.discord_user_id is not null
    and v_target.discord_user_id is not null
    and v_source.discord_user_id <> v_target.discord_user_id then
    raise exception 'These identities are linked to different Discord users and cannot be merged automatically.';
  end if;

  if exists (
    select 1
    from public.player_external_identities external_identity
    where external_identity.league_id = p_league_id
      and external_identity.player_identity_id = p_source_player_identity_id
  ) then
    raise exception 'The source identity has an immutable EA mapping; keep it as the merge target.';
  end if;

  if exists (
    select 1
    from public.player_match_stats source_stats
    join public.player_match_stats target_stats
      on target_stats.league_id = source_stats.league_id
      and target_stats.match_id = source_stats.match_id
      and target_stats.player_identity_id = p_target_player_identity_id
    where source_stats.league_id = p_league_id
      and source_stats.player_identity_id = p_source_player_identity_id
  ) then
    raise exception 'These identities both appear in the same match and cannot be merged automatically.';
  end if;

  if exists (
    select 1
    from public.roster_memberships source_roster
    join public.roster_memberships target_roster
      on target_roster.league_id = source_roster.league_id
      and target_roster.season_id = source_roster.season_id
      and target_roster.player_identity_id = p_target_player_identity_id
      and target_roster.status = 'active'
      and target_roster.left_at is null
    where source_roster.league_id = p_league_id
      and source_roster.player_identity_id = p_source_player_identity_id
      and source_roster.status = 'active'
      and source_roster.left_at is null
  ) then
    raise exception 'Both identities have an active roster record in the same season.';
  end if;

  if exists (
    select 1
    from public.player_loans source_loan
    join public.player_loans target_loan
      on target_loan.league_id = source_loan.league_id
      and target_loan.season_id = source_loan.season_id
      and target_loan.player_identity_id = p_target_player_identity_id
      and target_loan.status = 'active'
      and target_loan.ended_at is null
    where source_loan.league_id = p_league_id
      and source_loan.player_identity_id = p_source_player_identity_id
      and source_loan.status = 'active'
      and source_loan.ended_at is null
  ) then
    raise exception 'Both identities have an active loan in the same season.';
  end if;

  insert into public.player_aliases (
    league_id,
    player_identity_id,
    alias,
    normalized_alias,
    source
  )
  values (
    p_league_id,
    p_target_player_identity_id,
    v_source.canonical_name,
    v_source.normalized_name,
    'identity_merge'
  )
  on conflict (league_id, normalized_alias) do nothing;

  delete from public.player_aliases source_alias
  using public.player_aliases target_alias
  where source_alias.league_id = p_league_id
    and source_alias.player_identity_id = p_source_player_identity_id
    and target_alias.league_id = source_alias.league_id
    and target_alias.player_identity_id = p_target_player_identity_id
    and target_alias.normalized_alias = source_alias.normalized_alias;

  update public.player_aliases
  set player_identity_id = p_target_player_identity_id,
      source = 'identity_merge'
  where league_id = p_league_id
    and player_identity_id = p_source_player_identity_id;
  get diagnostics v_alias_rows = row_count;

  update public.player_match_stats
  set player_identity_id = p_target_player_identity_id,
      updated_at = now()
  where league_id = p_league_id
    and player_identity_id = p_source_player_identity_id;
  get diagnostics v_stat_rows = row_count;

  update public.roster_memberships
  set player_identity_id = p_target_player_identity_id,
      updated_at = now()
  where league_id = p_league_id
    and player_identity_id = p_source_player_identity_id;

  update public.player_loans
  set player_identity_id = p_target_player_identity_id,
      updated_at = now()
  where league_id = p_league_id
    and player_identity_id = p_source_player_identity_id;

  update public.transfer_events
  set player_identity_id = p_target_player_identity_id
  where league_id = p_league_id
    and player_identity_id = p_source_player_identity_id;

  update public.player_identities
  set discord_user_id = coalesce(v_target.discord_user_id, v_source.discord_user_id),
      current_team_id = coalesce(v_target.current_team_id, v_source.current_team_id),
      updated_at = now()
  where id = p_target_player_identity_id;

  delete from public.player_identities
  where id = p_source_player_identity_id;

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
    'player.identities_merged',
    'player_identity',
    p_target_player_identity_id,
    jsonb_build_object('source', to_jsonb(v_source), 'target', to_jsonb(v_target)),
    jsonb_build_object(
      'target_player_identity_id', p_target_player_identity_id,
      'moved_stat_rows', v_stat_rows,
      'moved_alias_rows', v_alias_rows
    ),
    btrim(p_reason)
  );

  return p_target_player_identity_id;
end;
$$;

create or replace view public.atheus_standings
with (security_invoker = true)
as
with recursive replacement_paths as (
  select
    replacement.league_id,
    replacement.season_id,
    replacement.outgoing_team_id as original_team_id,
    replacement.incoming_team_id as effective_team_id,
    1 as depth,
    array[replacement.outgoing_team_id, replacement.incoming_team_id] as visited
  from public.team_replacements replacement
  where replacement.transfer_table_record

  union all

  select
    path.league_id,
    path.season_id,
    path.original_team_id,
    replacement.incoming_team_id,
    path.depth + 1,
    path.visited || replacement.incoming_team_id
  from replacement_paths path
  join public.team_replacements replacement
    on replacement.league_id = path.league_id
    and replacement.season_id = path.season_id
    and replacement.outgoing_team_id = path.effective_team_id
    and replacement.transfer_table_record
  where not replacement.incoming_team_id = any(path.visited)
),
replacement_map as (
  select distinct on (league_id, season_id, original_team_id)
    league_id,
    season_id,
    original_team_id,
    effective_team_id
  from replacement_paths
  order by league_id, season_id, original_team_id, depth desc
),
eligible_teams as (
  select
    l.id as league_id,
    l.slug as league_slug,
    s.id as season_id,
    s.name as season_name,
    c.id as competition_id,
    c.name as competition_name,
    t.id as team_id,
    t.name as team_name,
    t.slug as team_slug,
    t.abbreviation,
    t.logo_url,
    t.primary_colour
  from public.leagues l
  join public.seasons s
    on s.league_id = l.id
    and s.status in ('active', 'completed')
  join public.competitions c
    on c.league_id = l.id
    and c.season_id = s.id
    and c.kind = 'league'
    and c.active
  join public.teams t
    on t.league_id = l.id
    and (
      t.status = 'active'
      or (
        t.status = 'replaced'
        and not exists (
          select 1
          from replacement_map hidden
          where hidden.league_id = l.id
            and hidden.season_id = s.id
            and hidden.original_team_id = t.id
        )
      )
    )
  where l.status = 'active'
),
team_results as (
  select
    f.league_id,
    f.season_id,
    f.competition_id,
    coalesce(home_map.effective_team_id, f.home_team_id) as team_id,
    m.home_score as goals_for,
    m.away_score as goals_against,
    (m.home_score > m.away_score)::integer as won,
    (m.home_score = m.away_score)::integer as drawn,
    (m.home_score < m.away_score)::integer as lost
  from public.matches m
  join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
  join public.competitions c
    on c.id = f.competition_id
    and c.league_id = f.league_id
    and c.kind = 'league'
  left join replacement_map home_map
    on home_map.league_id = f.league_id
    and home_map.season_id = f.season_id
    and home_map.original_team_id = f.home_team_id
  where not m.is_void

  union all

  select
    f.league_id,
    f.season_id,
    f.competition_id,
    coalesce(away_map.effective_team_id, f.away_team_id) as team_id,
    m.away_score as goals_for,
    m.home_score as goals_against,
    (m.away_score > m.home_score)::integer as won,
    (m.away_score = m.home_score)::integer as drawn,
    (m.away_score < m.home_score)::integer as lost
  from public.matches m
  join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
  join public.competitions c
    on c.id = f.competition_id
    and c.league_id = f.league_id
    and c.kind = 'league'
  left join replacement_map away_map
    on away_map.league_id = f.league_id
    and away_map.season_id = f.season_id
    and away_map.original_team_id = f.away_team_id
  where not m.is_void
),
aggregated as (
  select
    tr.league_id,
    tr.season_id,
    tr.competition_id,
    tr.team_id,
    count(*)::integer as played,
    sum(tr.won)::integer as won,
    sum(tr.drawn)::integer as drawn,
    sum(tr.lost)::integer as lost,
    sum(tr.goals_for)::integer as goals_for,
    sum(tr.goals_against)::integer as goals_against
  from team_results tr
  group by tr.league_id, tr.season_id, tr.competition_id, tr.team_id
)
select
  et.league_id,
  et.league_slug,
  et.season_id,
  et.season_name,
  et.competition_id,
  et.competition_name,
  et.team_id,
  et.team_name,
  et.team_slug,
  et.abbreviation,
  et.logo_url,
  et.primary_colour,
  coalesce(a.played, 0)::integer as played,
  coalesce(a.won, 0)::integer as won,
  coalesce(a.drawn, 0)::integer as drawn,
  coalesce(a.lost, 0)::integer as lost,
  coalesce(a.goals_for, 0)::integer as goals_for,
  coalesce(a.goals_against, 0)::integer as goals_against,
  (coalesce(a.goals_for, 0) - coalesce(a.goals_against, 0))::integer
    as goal_difference,
  (
    coalesce(a.won, 0) * settings.points_for_win
    + coalesce(a.drawn, 0) * settings.points_for_draw
    + coalesce(a.lost, 0) * settings.points_for_loss
  )::integer as points
from eligible_teams et
join public.league_settings settings on settings.league_id = et.league_id
left join aggregated a
  on a.league_id = et.league_id
  and a.season_id = et.season_id
  and a.competition_id = et.competition_id
  and a.team_id = et.team_id;

revoke all on function public.atheus_normalize_player_name(text)
  from public, anon, authenticated;
grant execute on function public.atheus_normalize_player_name(text)
  to service_role;

revoke all on function public.replace_league_team(
  uuid, uuid, uuid, uuid, text, timestamptz, boolean, boolean, text
) from public, anon, authenticated;
grant execute on function public.replace_league_team(
  uuid, uuid, uuid, uuid, text, timestamptz, boolean, boolean, text
) to service_role;

revoke all on function public.update_player_identity(
  uuid, uuid, text, text, text, uuid, text
) from public, anon, authenticated;
grant execute on function public.update_player_identity(
  uuid, uuid, text, text, text, uuid, text
) to service_role;

revoke all on function public.add_player_alias(
  uuid, uuid, text, text, text
) from public, anon, authenticated;
grant execute on function public.add_player_alias(
  uuid, uuid, text, text, text
) to service_role;

revoke all on function public.remove_player_alias(
  uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.remove_player_alias(
  uuid, uuid, text, text
) to service_role;

revoke all on function public.merge_player_identities(
  uuid, uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.merge_player_identities(
  uuid, uuid, uuid, text, text
) to service_role;

revoke all on public.atheus_standings from public, anon, authenticated;
grant select on public.atheus_standings to service_role;

comment on function public.replace_league_team(
  uuid, uuid, uuid, uuid, text, timestamptz, boolean, boolean, text
) is 'Audited mid-season team replacement with guarded future-fixture and table-record transfer.';
comment on function public.merge_player_identities(
  uuid, uuid, uuid, text, text
) is 'Safely consolidates duplicate player identities after checking match, roster and loan collisions.';
comment on view public.atheus_standings is
  'Approved league table with optional chained team-replacement record continuity.';

commit;

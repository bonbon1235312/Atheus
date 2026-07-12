alter table public.collector_runs
  add column if not exists worker_id text,
  add column if not exists heartbeat_at timestamptz,
  add column if not exists last_error text;

create index if not exists collector_runs_active_worker_idx
  on public.collector_runs (worker_id, status, started_at desc)
  where status = 'running';

create or replace function public.atheus_collector_targets(
  p_now timestamptz default now(),
  p_limit integer default 250
)
returns table (
  league_id uuid,
  league_name text,
  league_timezone text,
  fixture_id uuid,
  season_id uuid,
  competition_id uuid,
  competition_kind text,
  kickoff_at timestamptz,
  window_opens_at timestamptz,
  window_closes_at timestamptz,
  home_team_id uuid,
  home_team_name text,
  home_ea_club_id text,
  away_team_id uuid,
  away_team_name text,
  away_ea_club_id text,
  platform text,
  match_type text
)
language sql
stable
set search_path = ''
as $$
  with candidates as (
    select
      league.id as league_id,
      league.name as league_name,
      league.timezone as league_timezone,
      fixture.id as fixture_id,
      fixture.season_id,
      fixture.competition_id,
      competition.kind as competition_kind,
      fixture.kickoff_at,
      fixture.home_team_id,
      home_team.name as home_team_name,
      fixture.away_team_id,
      away_team.name as away_team_name,
      settings.default_platform as platform,
      settings.default_match_type as match_type,
      slot.collector_before_minutes,
      slot.collector_after_minutes
    from public.fixtures as fixture
    join public.leagues as league
      on league.id = fixture.league_id
    join public.league_settings as settings
      on settings.league_id = league.id
    join public.competitions as competition
      on competition.league_id = fixture.league_id
     and competition.id = fixture.competition_id
    join public.teams as home_team
      on home_team.league_id = fixture.league_id
     and home_team.id = fixture.home_team_id
    join public.teams as away_team
      on away_team.league_id = fixture.league_id
     and away_team.id = fixture.away_team_id
    cross join lateral (
      select
        schedule.collector_before_minutes,
        schedule.collector_after_minutes
      from public.league_schedule_slots as schedule
      where schedule.league_id = fixture.league_id
        and schedule.active
        and schedule.weekday = extract(
          dow from fixture.kickoff_at at time zone league.timezone
        )::smallint
        and schedule.local_kickoff_time =
          (fixture.kickoff_at at time zone league.timezone)::time
        and (schedule.season_id is null or schedule.season_id = fixture.season_id)
        and (
          schedule.competition_id is null
          or schedule.competition_id = fixture.competition_id
        )
      order by
        (schedule.competition_id is not null) desc,
        (schedule.season_id is not null) desc
      limit 1
    ) as slot
    where league.status = 'active'
      and settings.collector_enabled
      and fixture.status in ('scheduled', 'collecting', 'pending_review')
      and home_team.status = 'active'
      and away_team.status = 'active'
  )
  select
    candidate.league_id,
    candidate.league_name,
    candidate.league_timezone,
    candidate.fixture_id,
    candidate.season_id,
    candidate.competition_id,
    candidate.competition_kind,
    candidate.kickoff_at,
    candidate.kickoff_at
      - make_interval(mins => candidate.collector_before_minutes)
      as window_opens_at,
    candidate.kickoff_at
      + make_interval(mins => candidate.collector_after_minutes)
      as window_closes_at,
    candidate.home_team_id,
    candidate.home_team_name,
    home_link.ea_club_id as home_ea_club_id,
    candidate.away_team_id,
    candidate.away_team_name,
    away_link.ea_club_id as away_ea_club_id,
    candidate.platform,
    candidate.match_type
  from candidates as candidate
  cross join lateral (
    select link.ea_club_id
    from public.team_ea_club_links as link
    where link.league_id = candidate.league_id
      and link.team_id = candidate.home_team_id
      and link.platform = candidate.platform
      and link.active_from <= candidate.kickoff_at
      and (link.inactive_at is null or link.inactive_at > candidate.kickoff_at)
    order by link.active_from desc
    limit 1
  ) as home_link
  cross join lateral (
    select link.ea_club_id
    from public.team_ea_club_links as link
    where link.league_id = candidate.league_id
      and link.team_id = candidate.away_team_id
      and link.platform = candidate.platform
      and link.active_from <= candidate.kickoff_at
      and (link.inactive_at is null or link.inactive_at > candidate.kickoff_at)
    order by link.active_from desc
    limit 1
  ) as away_link
  where p_now between
    candidate.kickoff_at - make_interval(mins => candidate.collector_before_minutes)
    and candidate.kickoff_at + make_interval(mins => candidate.collector_after_minutes)
  order by candidate.kickoff_at, candidate.league_id, candidate.fixture_id
  limit greatest(1, least(coalesce(p_limit, 250), 1000));
$$;

create or replace function public.begin_collector_run(
  p_worker_id text,
  p_league_id uuid,
  p_target_fixture_count integer
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_run_id uuid;
begin
  if btrim(coalesce(p_worker_id, '')) = '' then
    raise exception 'Collector worker ID is required.';
  end if;

  if not exists (
    select 1
    from public.leagues
    where id = p_league_id
      and status = 'active'
  ) then
    raise exception 'Collector league is not active.';
  end if;

  insert into public.collector_runs (
    league_id,
    worker_id,
    status,
    target_fixture_count,
    heartbeat_at,
    diagnostics
  )
  values (
    p_league_id,
    left(btrim(p_worker_id), 120),
    'running',
    greatest(coalesce(p_target_fixture_count, 0), 0),
    now(),
    jsonb_build_object('started_by', left(btrim(p_worker_id), 120))
  )
  returning id into v_run_id;

  return v_run_id;
end;
$$;

create or replace function public.ingest_match_import(
  p_worker_id text,
  p_run_id uuid,
  p_league_id uuid,
  p_fixture_id uuid,
  p_confidence text,
  p_ea_match_id text,
  p_platform text,
  p_match_type text,
  p_played_at timestamptz,
  p_home_score integer,
  p_away_score integer,
  p_raw_payload jsonb,
  p_diagnostics jsonb,
  p_player_rows jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_fixture public.fixtures%rowtype;
  v_import_id uuid;
  v_existing_status text;
  v_existing_fixture_id uuid;
  v_idempotency_key text;
  v_row jsonb;
  v_team_id uuid;
  v_ea_player_id text;
  v_gamertag text;
  v_normalized_gamertag text;
  v_platform text := lower(btrim(coalesce(p_platform, '')));
  v_match_type text := btrim(coalesce(p_match_type, ''));
  v_score_only boolean := false;
begin
  if btrim(coalesce(p_worker_id, '')) = '' then
    raise exception 'Collector worker ID is required.';
  end if;

  if p_confidence not in ('definite', 'possible') then
    raise exception 'Only definite or possible packages may be ingested.';
  end if;

  if btrim(coalesce(p_ea_match_id, '')) = '' then
    raise exception 'EA match ID is required.';
  end if;

  if v_platform = '' then
    raise exception 'EA platform is required.';
  end if;

  if v_match_type = '' then
    raise exception 'EA match type is required.';
  end if;

  if p_home_score is null or p_away_score is null
     or p_home_score < 0 or p_away_score < 0 then
    raise exception 'A valid scoreline is required.';
  end if;

  if jsonb_typeof(coalesce(p_player_rows, '[]'::jsonb)) <> 'array' then
    raise exception 'Player rows must be a JSON array.';
  end if;

  v_score_only := jsonb_array_length(coalesce(p_player_rows, '[]'::jsonb)) = 0;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      concat_ws(
        ':',
        p_league_id::text,
        v_platform,
        lower(v_match_type),
        btrim(p_ea_match_id)
      ),
      0
    )
  );

  if not exists (
    select 1
    from public.collector_runs
    where id = p_run_id
      and league_id = p_league_id
      and worker_id = left(btrim(p_worker_id), 120)
      and status = 'running'
  ) then
    raise exception 'Collector run is not active for this worker and league.';
  end if;

  select *
  into v_fixture
  from public.fixtures
  where id = p_fixture_id
    and league_id = p_league_id
  for update;

  if not found then
    raise exception 'Fixture was not found in this league.';
  end if;

  if v_fixture.status in ('completed', 'cancelled') then
    raise exception 'Fixture no longer accepts collector packages.';
  end if;

  v_idempotency_key := md5(
    concat_ws(
      ':',
      p_league_id::text,
      v_platform,
      lower(v_match_type),
      btrim(p_ea_match_id)
    )
  );

  select id, status, fixture_id
  into v_import_id, v_existing_status, v_existing_fixture_id
  from public.match_imports
  where league_id = p_league_id
    and lower(coalesce(nullif(btrim(platform), ''), 'unknown')) = v_platform
    and lower(coalesce(nullif(btrim(match_type), ''), 'unknown')) = lower(v_match_type)
    and btrim(ea_match_id) = btrim(p_ea_match_id)
  for update;

  if v_existing_fixture_id is not null and v_existing_fixture_id <> p_fixture_id then
    raise exception 'EA match is already attached to a different fixture.';
  end if;

  if found and v_existing_status <> 'pending' then
    if v_score_only then
      raise exception 'A finalized import cannot be replaced by a score-only candidate.';
    end if;
    return v_import_id;
  end if;

  if v_import_id is null then
    insert into public.match_imports (
      league_id,
      fixture_id,
      source,
      confidence,
      status,
      ea_match_id,
      platform,
      match_type,
      played_at,
      home_score,
      away_score,
      raw_payload,
      diagnostics,
      idempotency_key
    )
    values (
      p_league_id,
      p_fixture_id,
      'ea_clubs',
      p_confidence,
      'pending',
      btrim(p_ea_match_id),
      v_platform,
      v_match_type,
      p_played_at,
      p_home_score,
      p_away_score,
      coalesce(p_raw_payload, '{}'::jsonb),
      coalesce(p_diagnostics, '{}'::jsonb)
        || jsonb_build_object('collector_worker_id', left(btrim(p_worker_id), 120))
        || case
          when v_score_only then jsonb_build_object(
            'score_only_candidate', true,
            'score_only_human_override_required', true,
            'player_row_count', 0
          )
          else jsonb_build_object(
            'score_only_candidate', false,
            'score_only_human_override_required', false,
            'player_row_count', jsonb_array_length(p_player_rows)
          )
        end,
      v_idempotency_key
    )
    returning id into v_import_id;
  else
    update public.match_imports
    set
      confidence = p_confidence,
      played_at = p_played_at,
      home_score = p_home_score,
      away_score = p_away_score,
      raw_payload = coalesce(p_raw_payload, '{}'::jsonb),
      diagnostics = coalesce(p_diagnostics, '{}'::jsonb)
        || jsonb_build_object('collector_worker_id', left(btrim(p_worker_id), 120))
        || case
          when v_score_only then jsonb_build_object(
            'score_only_candidate', true,
            'score_only_human_override_required', true,
            'player_row_count', 0
          )
          else jsonb_build_object(
            'score_only_candidate', false,
            'score_only_human_override_required', false,
            'player_row_count', jsonb_array_length(p_player_rows)
          )
        end,
      collected_at = now()
    where id = v_import_id
      and league_id = p_league_id;

    delete from public.match_import_player_rows
    where league_id = p_league_id
      and match_import_id = v_import_id;
  end if;

  for v_row in
    select value
    from jsonb_array_elements(coalesce(p_player_rows, '[]'::jsonb))
  loop
    v_team_id := nullif(v_row ->> 'team_id', '')::uuid;
    v_ea_player_id := btrim(coalesce(v_row ->> 'ea_player_id', ''));
    v_gamertag := btrim(coalesce(v_row ->> 'gamertag', ''));
    v_normalized_gamertag := lower(
      regexp_replace(v_gamertag, '[^[:alnum:]]+', '', 'g')
    );

    if v_team_id is null
       or v_team_id not in (v_fixture.home_team_id, v_fixture.away_team_id) then
      raise exception 'Player row team does not belong to the fixture.';
    end if;

    if v_gamertag = '' or v_normalized_gamertag = '' then
      raise exception 'Every player row requires a valid gamertag.';
    end if;

    if v_ea_player_id = '' then
      raise exception 'Every player row requires an EA player ID.';
    end if;

    insert into public.match_import_player_rows (
      league_id,
      match_import_id,
      team_id,
      ea_player_id,
      gamertag,
      normalized_gamertag,
      position_code,
      goals,
      assists,
      rating,
      shots,
      passes_made,
      pass_attempts,
      pass_accuracy_pct,
      tackles_made,
      saves,
      red_cards,
      minutes_played,
      clean_sheet,
      raw_row
    )
    values (
      p_league_id,
      v_import_id,
      v_team_id,
      v_ea_player_id,
      v_gamertag,
      v_normalized_gamertag,
      nullif(upper(btrim(v_row ->> 'position_code')), ''),
      greatest(coalesce((v_row ->> 'goals')::integer, 0), 0),
      greatest(coalesce((v_row ->> 'assists')::integer, 0), 0),
      nullif(v_row ->> 'rating', '')::numeric,
      nullif(v_row ->> 'shots', '')::integer,
      nullif(v_row ->> 'passes_made', '')::integer,
      nullif(v_row ->> 'pass_attempts', '')::integer,
      nullif(v_row ->> 'pass_accuracy_pct', '')::numeric,
      nullif(v_row ->> 'tackles_made', '')::integer,
      nullif(v_row ->> 'saves', '')::integer,
      nullif(v_row ->> 'red_cards', '')::integer,
      nullif(v_row ->> 'minutes_played', '')::integer,
      nullif(v_row ->> 'clean_sheet', '')::boolean,
      coalesce(v_row -> 'raw_row', v_row)
    )
    on conflict (league_id, match_import_id, team_id, normalized_gamertag)
    do update set
      ea_player_id = excluded.ea_player_id,
      gamertag = excluded.gamertag,
      position_code = excluded.position_code,
      goals = excluded.goals,
      assists = excluded.assists,
      rating = excluded.rating,
      shots = excluded.shots,
      passes_made = excluded.passes_made,
      pass_attempts = excluded.pass_attempts,
      pass_accuracy_pct = excluded.pass_accuracy_pct,
      tackles_made = excluded.tackles_made,
      saves = excluded.saves,
      red_cards = excluded.red_cards,
      minutes_played = excluded.minutes_played,
      clean_sheet = excluded.clean_sheet,
      raw_row = excluded.raw_row;
  end loop;

  update public.fixtures
  set status = 'pending_review',
      updated_at = now()
  where id = p_fixture_id
    and league_id = p_league_id
    and status in ('scheduled', 'collecting', 'pending_review');

  update public.collector_runs
  set
    heartbeat_at = now(),
    definite_count = definite_count
      + case when p_confidence = 'definite' then 1 else 0 end,
    possible_count = possible_count
      + case when p_confidence = 'possible' then 1 else 0 end
  where id = p_run_id
    and league_id = p_league_id;

  return v_import_id;
end;
$$;

create or replace function public.finish_collector_run(
  p_worker_id text,
  p_run_id uuid,
  p_league_id uuid,
  p_status text,
  p_fetched_club_count integer default 0,
  p_no_stats_count integer default 0,
  p_access_denied_count integer default 0,
  p_error_count integer default 0,
  p_next_retry_at timestamptz default null,
  p_last_error text default null,
  p_diagnostics jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  if p_status not in ('completed', 'partial', 'failed') then
    raise exception 'Collector run must finish as completed, partial or failed.';
  end if;

  update public.collector_runs
  set
    status = p_status,
    finished_at = now(),
    heartbeat_at = now(),
    fetched_club_count = greatest(coalesce(p_fetched_club_count, 0), 0),
    no_stats_count = greatest(coalesce(p_no_stats_count, 0), 0),
    access_denied_count = greatest(coalesce(p_access_denied_count, 0), 0),
    error_count = greatest(coalesce(p_error_count, 0), 0),
    next_retry_at = p_next_retry_at,
    last_error = nullif(left(coalesce(p_last_error, ''), 2000), ''),
    diagnostics = diagnostics || coalesce(p_diagnostics, '{}'::jsonb)
  where id = p_run_id
    and league_id = p_league_id
    and worker_id = left(btrim(p_worker_id), 120)
    and status = 'running';

  return found;
end;
$$;

create or replace function public.set_league_collector_enabled(
  p_league_id uuid,
  p_actor_discord_user_id text,
  p_enabled boolean
)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_actor_discord_user_id
      and active
      and role in ('owner', 'admin')
  ) then
    raise exception 'League owner or admin access is required.';
  end if;

  update public.league_settings
  set collector_enabled = p_enabled,
      updated_at = now()
  where league_id = p_league_id;

  if not found then
    raise exception 'League settings were not found.';
  end if;

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
    p_actor_discord_user_id,
    'collector.enabled_changed',
    'league_settings',
    p_league_id::text,
    jsonb_build_object('collector_enabled', p_enabled)
  );

  return true;
end;
$$;

revoke all on function public.atheus_collector_targets(timestamptz, integer)
  from public, anon, authenticated;
revoke all on function public.begin_collector_run(text, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.ingest_match_import(
  text, uuid, uuid, uuid, text, text, text, text, timestamptz,
  integer, integer, jsonb, jsonb, jsonb
) from public, anon, authenticated;
revoke all on function public.finish_collector_run(
  text, uuid, uuid, text, integer, integer, integer, integer,
  timestamptz, text, jsonb
) from public, anon, authenticated;
revoke all on function public.set_league_collector_enabled(uuid, text, boolean)
  from public, anon, authenticated;

grant execute on function public.atheus_collector_targets(timestamptz, integer)
  to service_role;
grant execute on function public.begin_collector_run(text, uuid, integer)
  to service_role;
grant execute on function public.ingest_match_import(
  text, uuid, uuid, uuid, text, text, text, text, timestamptz,
  integer, integer, jsonb, jsonb, jsonb
) to service_role;
grant execute on function public.finish_collector_run(
  text, uuid, uuid, text, integer, integer, integer, integer,
  timestamptz, text, jsonb
) to service_role;
grant execute on function public.set_league_collector_enabled(uuid, text, boolean)
  to service_role;

comment on function public.atheus_collector_targets(timestamptz, integer) is
  'Returns active fixture windows with historically correct EA club links for the private collector.';
comment on function public.ingest_match_import(
  text, uuid, uuid, uuid, text, text, text, text, timestamptz,
  integer, integer, jsonb, jsonb, jsonb
) is
  'Stores one durable EA match package; empty player arrays remain pending for explicit human override.';

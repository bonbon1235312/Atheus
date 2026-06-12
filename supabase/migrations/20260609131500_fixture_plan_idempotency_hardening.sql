begin;

create or replace function public.publish_fixture_plan(
  p_league_id uuid,
  p_discord_user_id text,
  p_season_id uuid,
  p_competition_id uuid,
  p_plan_key text,
  p_fixtures jsonb,
  p_generation_config jsonb default '{}'::jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fixture_count integer;
  v_matching_count integer;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin', 'fixture_manager')
  ) then
    raise exception 'Fixture manager access is required.';
  end if;

  if not exists (
    select 1
    from public.competitions
    where league_id = p_league_id
      and season_id = p_season_id
      and id = p_competition_id
      and active
  ) then
    raise exception 'Competition not found.';
  end if;

  if coalesce(p_plan_key, '') !~ '^[a-z0-9]+$' then
    raise exception 'Fixture plan key is invalid.';
  end if;

  if jsonb_typeof(p_fixtures) <> 'array' then
    raise exception 'Fixture plan must be a JSON array.';
  end if;

  v_fixture_count := jsonb_array_length(p_fixtures);
  if v_fixture_count < 1 or v_fixture_count > 500 then
    raise exception 'Fixture plan must contain between 1 and 500 fixtures.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_fixtures) as row(
      external_fixture_key text,
      gameday_number integer,
      round_label text,
      kickoff_at timestamptz,
      home_team_id uuid,
      away_team_id uuid
    )
    where row.external_fixture_key is null
      or row.external_fixture_key not like 'generator:' || p_plan_key || ':%'
      or row.gameday_number is null
      or row.gameday_number < 1
      or row.round_label is null
      or btrim(row.round_label) = ''
      or row.kickoff_at is null
      or row.home_team_id is null
      or row.away_team_id is null
      or row.home_team_id = row.away_team_id
  ) then
    raise exception 'Fixture plan contains an invalid row.';
  end if;

  if (
    select count(distinct row.external_fixture_key)
    from jsonb_to_recordset(p_fixtures) as row(external_fixture_key text)
  ) <> v_fixture_count then
    raise exception 'Fixture plan contains duplicate fixture keys.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_fixtures) as row(
      home_team_id uuid,
      away_team_id uuid
    )
    where not exists (
      select 1
      from public.teams
      where league_id = p_league_id
        and id = row.home_team_id
        and status = 'active'
    )
    or not exists (
      select 1
      from public.teams
      where league_id = p_league_id
        and id = row.away_team_id
        and status = 'active'
    )
  ) then
    raise exception 'Fixture plan contains an inactive or foreign team.';
  end if;

  select count(*) into v_matching_count
  from public.fixtures fixture
  join jsonb_to_recordset(p_fixtures) as row(
    external_fixture_key text,
    gameday_number integer,
    round_label text,
    kickoff_at timestamptz,
    home_team_id uuid,
    away_team_id uuid
  )
    on row.external_fixture_key = fixture.external_fixture_key
    and row.gameday_number = fixture.gameday_number
    and btrim(row.round_label) = fixture.round_label
    and row.kickoff_at = fixture.kickoff_at
    and row.home_team_id = fixture.home_team_id
    and row.away_team_id = fixture.away_team_id
  where fixture.league_id = p_league_id
    and fixture.season_id = p_season_id
    and fixture.competition_id = p_competition_id;

  if v_matching_count = v_fixture_count then
    return v_fixture_count;
  end if;

  if exists (
    select 1
    from public.fixtures
    where league_id = p_league_id
      and season_id = p_season_id
      and competition_id = p_competition_id
  ) then
    raise exception 'This competition already has a different fixture schedule.';
  end if;

  insert into public.fixtures (
    league_id,
    season_id,
    competition_id,
    external_fixture_key,
    gameday_number,
    round_label,
    kickoff_at,
    home_team_id,
    away_team_id,
    status,
    published_at
  )
  select
    p_league_id,
    p_season_id,
    p_competition_id,
    row.external_fixture_key,
    row.gameday_number,
    btrim(row.round_label),
    row.kickoff_at,
    row.home_team_id,
    row.away_team_id,
    'scheduled',
    now()
  from jsonb_to_recordset(p_fixtures) as row(
    external_fixture_key text,
    gameday_number integer,
    round_label text,
    kickoff_at timestamptz,
    home_team_id uuid,
    away_team_id uuid
  );

  update public.competitions
  set format_config = coalesce(format_config, '{}'::jsonb) || jsonb_build_object(
        'fixture_generator',
        coalesce(p_generation_config, '{}'::jsonb) || jsonb_build_object(
          'plan_key', p_plan_key,
          'published_at', now(),
          'fixture_count', v_fixture_count
        )
      ),
      updated_at = now()
  where league_id = p_league_id
    and season_id = p_season_id
    and id = p_competition_id;

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
    'fixtures.plan_published',
    'competition',
    p_competition_id,
    jsonb_build_object(
      'season_id', p_season_id,
      'plan_key', p_plan_key,
      'fixture_count', v_fixture_count,
      'generation_config', coalesce(p_generation_config, '{}'::jsonb)
    )
  );

  return v_fixture_count;
end;
$$;

revoke all on function public.publish_fixture_plan(
  uuid, text, uuid, uuid, text, jsonb, jsonb
) from public, anon, authenticated;

grant execute on function public.publish_fixture_plan(
  uuid, text, uuid, uuid, text, jsonb, jsonb
) to service_role;

commit;

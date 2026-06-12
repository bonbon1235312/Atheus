begin;

create or replace function public.manage_fixture_lifecycle(
  p_league_id uuid,
  p_fixture_id uuid,
  p_discord_user_id text,
  p_action text,
  p_kickoff_at timestamptz default null,
  p_reason text default null
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_fixture public.fixtures%rowtype;
  v_before jsonb;
  v_status text;
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

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'A reason is required.';
  end if;

  if p_action not in ('reschedule', 'postpone', 'cancel', 'restore') then
    raise exception 'Unsupported fixture action.';
  end if;

  select * into v_fixture
  from public.fixtures
  where id = p_fixture_id
    and league_id = p_league_id
  for update;

  if v_fixture.id is null then
    raise exception 'Fixture was not found.';
  end if;

  if exists (
    select 1
    from public.matches
    where league_id = p_league_id
      and fixture_id = p_fixture_id
  ) then
    raise exception 'Remove or correct the approved result before changing this fixture.';
  end if;

  v_before := jsonb_build_object(
    'kickoff_at', v_fixture.kickoff_at,
    'status', v_fixture.status,
    'result_note', v_fixture.result_note
  );

  if p_action = 'reschedule' then
    if p_kickoff_at is null then
      raise exception 'A new kickoff time is required.';
    end if;
    v_status := 'scheduled';

    update public.fixtures
    set kickoff_at = p_kickoff_at,
        status = v_status,
        result_note = btrim(p_reason),
        updated_at = now()
    where id = p_fixture_id;
  elsif p_action = 'postpone' then
    v_status := 'postponed';

    update public.fixtures
    set status = v_status,
        result_note = btrim(p_reason),
        updated_at = now()
    where id = p_fixture_id;
  elsif p_action = 'cancel' then
    v_status := 'cancelled';

    update public.fixtures
    set status = v_status,
        result_note = btrim(p_reason),
        updated_at = now()
    where id = p_fixture_id;
  else
    v_status := 'scheduled';

    update public.fixtures
    set status = v_status,
        result_note = btrim(p_reason),
        updated_at = now()
    where id = p_fixture_id;
  end if;

  if p_action in ('reschedule', 'postpone', 'cancel') then
    update public.match_imports
    set status = 'superseded',
        reviewed_at = now(),
        reviewed_by_discord_user_id = p_discord_user_id,
        review_note = 'Fixture ' || p_action || ': ' || btrim(p_reason)
    where league_id = p_league_id
      and fixture_id = p_fixture_id
      and status = 'pending';
  end if;

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
    'fixture.' || p_action,
    'fixture',
    p_fixture_id,
    v_before,
    jsonb_build_object(
      'kickoff_at', coalesce(p_kickoff_at, v_fixture.kickoff_at),
      'status', v_status,
      'result_note', btrim(p_reason)
    ),
    btrim(p_reason)
  );

  return v_status;
end;
$$;

create or replace function public.override_fixture_result(
  p_league_id uuid,
  p_fixture_id uuid,
  p_discord_user_id text,
  p_home_score integer,
  p_away_score integer,
  p_is_forfeit boolean default false,
  p_erase_player_stats boolean default false,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_fixture public.fixtures%rowtype;
  v_match public.matches%rowtype;
  v_match_id uuid;
  v_before jsonb;
  v_erased_stats integer := 0;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin', 'reviewer')
  ) then
    raise exception 'Match reviewer access is required.';
  end if;

  if p_home_score is null or p_home_score < 0
    or p_away_score is null or p_away_score < 0 then
    raise exception 'Enter a valid non-negative scoreline.';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'A correction reason is required.';
  end if;

  select * into v_fixture
  from public.fixtures
  where id = p_fixture_id
    and league_id = p_league_id
  for update;

  if v_fixture.id is null then
    raise exception 'Fixture was not found.';
  end if;

  if v_fixture.status = 'cancelled' then
    raise exception 'Restore the cancelled fixture before recording a result.';
  end if;

  select * into v_match
  from public.matches
  where league_id = p_league_id
    and fixture_id = p_fixture_id
  for update;

  v_before := jsonb_build_object(
    'fixture_status', v_fixture.status,
    'home_score', coalesce(v_match.home_score, v_fixture.home_score),
    'away_score', coalesce(v_match.away_score, v_fixture.away_score),
    'result_source', coalesce(v_match.result_source, v_fixture.result_source),
    'is_forfeit', coalesce(v_match.is_forfeit, false)
  );

  if v_match.id is null then
    insert into public.matches (
      league_id,
      fixture_id,
      home_score,
      away_score,
      result_source,
      is_forfeit,
      is_void,
      correction_reason,
      approved_by_discord_user_id
    )
    values (
      p_league_id,
      p_fixture_id,
      p_home_score,
      p_away_score,
      'manual_override',
      coalesce(p_is_forfeit, false),
      false,
      btrim(p_reason),
      p_discord_user_id
    )
    returning id into v_match_id;
  else
    v_match_id := v_match.id;

    if p_erase_player_stats then
      delete from public.player_match_stats
      where league_id = p_league_id
        and match_id = v_match_id;
      get diagnostics v_erased_stats = row_count;
    end if;

    update public.matches
    set home_score = p_home_score,
        away_score = p_away_score,
        result_source = 'manual_override',
        is_forfeit = coalesce(p_is_forfeit, false),
        is_void = false,
        correction_reason = btrim(p_reason),
        approved_by_discord_user_id = p_discord_user_id,
        approved_at = now(),
        updated_at = now()
    where id = v_match_id;
  end if;

  update public.fixtures
  set status = 'completed',
      home_score = p_home_score,
      away_score = p_away_score,
      result_source = 'manual_override',
      result_note = btrim(p_reason),
      updated_at = now()
  where id = p_fixture_id;

  update public.match_imports
  set status = 'superseded',
      reviewed_at = now(),
      reviewed_by_discord_user_id = p_discord_user_id,
      review_note = 'Result manually overridden: ' || btrim(p_reason)
  where league_id = p_league_id
    and fixture_id = p_fixture_id
    and status = 'pending';

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
    'fixture.result_overridden',
    'fixture',
    p_fixture_id,
    v_before,
    jsonb_build_object(
      'match_id', v_match_id,
      'home_score', p_home_score,
      'away_score', p_away_score,
      'result_source', 'manual_override',
      'is_forfeit', coalesce(p_is_forfeit, false),
      'erased_player_stats', v_erased_stats
    ),
    btrim(p_reason)
  );

  return v_match_id;
end;
$$;

create or replace function public.erase_fixture_player_stats(
  p_league_id uuid,
  p_fixture_id uuid,
  p_discord_user_id text,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_match public.matches%rowtype;
  v_deleted integer := 0;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin', 'reviewer')
  ) then
    raise exception 'Match reviewer access is required.';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'A reason is required before erasing player statistics.';
  end if;

  select * into v_match
  from public.matches
  where league_id = p_league_id
    and fixture_id = p_fixture_id
  for update;

  if v_match.id is null then
    raise exception 'This fixture has no approved result.';
  end if;

  delete from public.player_match_stats
  where league_id = p_league_id
    and match_id = v_match.id;
  get diagnostics v_deleted = row_count;

  update public.matches
  set correction_reason = btrim(p_reason),
      updated_at = now()
  where id = v_match.id;

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
    'fixture.player_stats_erased',
    'fixture',
    p_fixture_id,
    jsonb_build_object('player_stat_rows', v_deleted),
    jsonb_build_object(
      'player_stat_rows', 0,
      'score_preserved', true,
      'match_id', v_match.id
    ),
    btrim(p_reason)
  );

  return v_deleted;
end;
$$;

revoke all on function public.manage_fixture_lifecycle(
  uuid, uuid, text, text, timestamptz, text
) from public, anon, authenticated;
grant execute on function public.manage_fixture_lifecycle(
  uuid, uuid, text, text, timestamptz, text
) to service_role;

revoke all on function public.override_fixture_result(
  uuid, uuid, text, integer, integer, boolean, boolean, text
) from public, anon, authenticated;
grant execute on function public.override_fixture_result(
  uuid, uuid, text, integer, integer, boolean, boolean, text
) to service_role;

revoke all on function public.erase_fixture_player_stats(
  uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.erase_fixture_player_stats(
  uuid, uuid, text, text
) to service_role;

comment on function public.manage_fixture_lifecycle(
  uuid, uuid, text, text, timestamptz, text
) is 'Audited tenant-scoped reschedule, postpone, cancel and restore controls.';

comment on function public.override_fixture_result(
  uuid, uuid, text, integer, integer, boolean, boolean, text
) is 'Audited manual result creation/correction with optional forfeit and stale-stat removal.';

comment on function public.erase_fixture_player_stats(
  uuid, uuid, text, text
) is 'Removes approved player rows while preserving the canonical scoreline.';

commit;

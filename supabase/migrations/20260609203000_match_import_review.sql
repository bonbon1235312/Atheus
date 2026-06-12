begin;

create or replace function public.approve_match_import(
  p_league_id uuid,
  p_import_id uuid,
  p_discord_user_id text,
  p_review_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_import public.match_imports%rowtype;
  v_fixture public.fixtures%rowtype;
  v_match_id uuid;
  v_row public.match_import_player_rows%rowtype;
  v_identity_id uuid;
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

  select * into v_import
  from public.match_imports
  where id = p_import_id and league_id = p_league_id
  for update;

  if v_import.id is null then
    raise exception 'Match import was not found.';
  end if;

  if v_import.status = 'approved' then
    select id into v_match_id
    from public.matches
    where league_id = p_league_id
      and approved_import_id = p_import_id;
    return v_match_id;
  end if;

  if v_import.status <> 'pending' then
    raise exception 'Only pending imports can be approved.';
  end if;

  if v_import.home_score is null or v_import.away_score is null then
    raise exception 'The import has no complete scoreline.';
  end if;

  select * into v_fixture
  from public.fixtures
  where id = v_import.fixture_id and league_id = p_league_id
  for update;

  if v_fixture.id is null then
    raise exception 'The fixture was not found.';
  end if;

  if exists (
    select 1 from public.matches
    where league_id = p_league_id and fixture_id = v_fixture.id
  ) then
    raise exception 'This fixture already has an approved result.';
  end if;

  insert into public.matches (
    league_id,
    fixture_id,
    approved_import_id,
    home_score,
    away_score,
    result_source,
    approved_by_discord_user_id
  )
  values (
    p_league_id,
    v_fixture.id,
    p_import_id,
    v_import.home_score,
    v_import.away_score,
    'ea_import',
    p_discord_user_id
  )
  returning id into v_match_id;

  for v_row in
    select *
    from public.match_import_player_rows
    where league_id = p_league_id
      and match_import_id = p_import_id
    order by created_at, id
  loop
    if v_row.team_id is null
      or v_row.team_id not in (v_fixture.home_team_id, v_fixture.away_team_id) then
      raise exception 'Every player row must map to one of the fixture teams.';
    end if;

    insert into public.player_identities (
      league_id,
      canonical_name,
      normalized_name,
      current_team_id
    )
    values (
      p_league_id,
      v_row.gamertag,
      v_row.normalized_gamertag,
      v_row.team_id
    )
    on conflict (league_id, normalized_name)
    do update set
      canonical_name = excluded.canonical_name,
      current_team_id = excluded.current_team_id,
      updated_at = now()
    returning id into v_identity_id;

    insert into public.player_aliases (
      league_id,
      player_identity_id,
      alias,
      normalized_alias,
      source
    )
    values (
      p_league_id,
      v_identity_id,
      v_row.gamertag,
      v_row.normalized_gamertag,
      'ea'
    )
    on conflict (league_id, normalized_alias) do nothing;

    insert into public.player_match_stats (
      league_id,
      match_id,
      team_id,
      player_identity_id,
      source_import_row_id,
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
      clean_sheet
    )
    values (
      p_league_id,
      v_match_id,
      v_row.team_id,
      v_identity_id,
      v_row.id,
      v_row.position_code,
      v_row.goals,
      v_row.assists,
      v_row.rating,
      v_row.shots,
      v_row.passes_made,
      v_row.pass_attempts,
      v_row.pass_accuracy_pct,
      v_row.tackles_made,
      v_row.saves,
      v_row.red_cards,
      v_row.minutes_played,
      v_row.clean_sheet
    );
  end loop;

  update public.match_imports
  set status = 'approved',
      reviewed_at = now(),
      reviewed_by_discord_user_id = p_discord_user_id,
      review_note = nullif(btrim(coalesce(p_review_note, '')), '')
  where id = p_import_id;

  update public.match_imports
  set status = 'superseded',
      reviewed_at = now(),
      reviewed_by_discord_user_id = p_discord_user_id,
      review_note = 'Another import for this fixture was approved.'
  where league_id = p_league_id
    and fixture_id = v_fixture.id
    and id <> p_import_id
    and status = 'pending';

  update public.fixtures
  set status = 'completed',
      home_score = v_import.home_score,
      away_score = v_import.away_score,
      result_source = 'ea_import',
      updated_at = now()
  where id = v_fixture.id;

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
    'match_import.approved',
    'match_import',
    p_import_id,
    jsonb_build_object(
      'fixture_id', v_fixture.id,
      'match_id', v_match_id,
      'home_score', v_import.home_score,
      'away_score', v_import.away_score
    ),
    nullif(btrim(coalesce(p_review_note, '')), '')
  );

  return v_match_id;
end;
$$;

create or replace function public.reject_match_import(
  p_league_id uuid,
  p_import_id uuid,
  p_discord_user_id text,
  p_review_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_import public.match_imports%rowtype;
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

  if btrim(coalesce(p_review_note, '')) = '' then
    raise exception 'A rejection reason is required.';
  end if;

  select * into v_import
  from public.match_imports
  where id = p_import_id and league_id = p_league_id
  for update;

  if v_import.id is null then
    raise exception 'Match import was not found.';
  end if;

  if v_import.status <> 'pending' then
    raise exception 'Only pending imports can be rejected.';
  end if;

  update public.match_imports
  set status = 'rejected',
      reviewed_at = now(),
      reviewed_by_discord_user_id = p_discord_user_id,
      review_note = btrim(p_review_note)
  where id = p_import_id;

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
    'match_import.rejected',
    'match_import',
    p_import_id,
    jsonb_build_object('status', 'pending'),
    jsonb_build_object('status', 'rejected'),
    btrim(p_review_note)
  );
end;
$$;

revoke all on function public.approve_match_import(
  uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.approve_match_import(
  uuid, uuid, text, text
) to service_role;

revoke all on function public.reject_match_import(
  uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.reject_match_import(
  uuid, uuid, text, text
) to service_role;

commit;

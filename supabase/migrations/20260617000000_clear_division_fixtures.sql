begin;

-- ────────────────────────────────────────────────────────────────────────────
-- clear_division_fixtures
-- Deletes the published schedule for a single competition (division) so it can
-- be regenerated. This is an escape hatch for a test/preview schedule that was
-- published before any real activity happened.
--
-- Hard safety rails: refuses to run if ANY fixture in the competition has an
-- approved result (matches) or a collected match import. Both of those tables
-- cascade-delete from fixtures, so allowing the delete would silently destroy
-- results and player stats. Schedule-only state (scheduled/postponed/cancelled
-- fixtures with no collected data) is safe to clear.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.clear_division_fixtures(
  p_league_id      uuid,
  p_competition_id uuid,
  p_discord_user_id text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_season_id    uuid;
  v_result_count integer;
  v_import_count integer;
  v_deleted      integer;
begin
  if not exists (
    select 1 from public.league_memberships
    where league_id      = p_league_id
      and discord_user_id = p_discord_user_id
      and active
      and role in ('owner', 'admin', 'fixture_manager')
  ) then
    raise exception 'Fixture manager access is required.';
  end if;

  select season_id into v_season_id
  from public.competitions
  where id        = p_competition_id
    and league_id = p_league_id;

  if v_season_id is null then
    raise exception 'Division not found in this league.';
  end if;

  -- Block on any approved result.
  select count(*) into v_result_count
  from public.matches m
  join public.fixtures f
    on f.league_id = m.league_id
   and f.id        = m.fixture_id
  where f.league_id      = p_league_id
    and f.competition_id = p_competition_id;

  if v_result_count > 0 then
    raise exception
      'Cannot clear: % fixture(s) in this division already have approved results. Edit results from the published fixtures list instead.',
      v_result_count;
  end if;

  -- Block on any collected import (pending or already reviewed).
  select count(*) into v_import_count
  from public.match_imports mi
  join public.fixtures f
    on f.league_id = mi.league_id
   and f.id        = mi.fixture_id
  where f.league_id      = p_league_id
    and f.competition_id = p_competition_id;

  if v_import_count > 0 then
    raise exception
      'Cannot clear: % collected match import(s) exist for this division. Clear the review queue before regenerating.',
      v_import_count;
  end if;

  delete from public.fixtures
  where league_id      = p_league_id
    and competition_id = p_competition_id;
  get diagnostics v_deleted = row_count;

  -- Drop the generator marker so the division reads as regenerable again.
  update public.competitions
  set format_config = coalesce(format_config, '{}'::jsonb) - 'fixture_generator',
      updated_at    = now()
  where id        = p_competition_id
    and league_id = p_league_id;

  insert into public.audit_logs (
    league_id, actor_discord_user_id, action, entity_type, entity_id, after_data
  ) values (
    p_league_id, p_discord_user_id, 'fixtures.cleared', 'competition', p_competition_id,
    jsonb_build_object('season_id', v_season_id, 'deleted_count', v_deleted)
  );

  return v_deleted;
end;
$$;

revoke all on function public.clear_division_fixtures(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.clear_division_fixtures(uuid, uuid, text)
  to service_role;

commit;

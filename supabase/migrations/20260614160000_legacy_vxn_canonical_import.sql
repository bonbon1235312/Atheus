begin;

create or replace function public.import_legacy_vxn_canonical(
  p_owner_discord_user_id text,
  p_discord_guild_id text,
  p_apply boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_league_id uuid;
  v_season_id uuid;
  v_league_competition_id uuid;
  v_cup_competition_id uuid;
  v_source_teams integer;
  v_source_fixtures integer;
  v_source_completed integer;
  v_source_stats integer;
  v_source_players integer;
  v_invalid_teams integer;
  v_invalid_fixtures integer;
  v_invalid_stats integer;
  v_result jsonb;
begin
  if btrim(coalesce(p_owner_discord_user_id, '')) = '' then
    raise exception 'The VXN owner Discord user ID is required.';
  end if;

  if btrim(coalesce(p_discord_guild_id, '')) = '' then
    raise exception 'The VXN Discord guild ID is required.';
  end if;

  if to_regclass('public.league_teams') is null
    or to_regclass('public.league_fixtures') is null
    or to_regclass('public.league_player_match_stats') is null then
    raise exception 'The legacy VXN source tables are not installed in this database.';
  end if;

  select count(*) into v_source_teams from public.league_teams;
  select count(*) into v_source_fixtures from public.league_fixtures;
  select count(*) into v_source_completed
  from public.league_fixtures
  where status = 'completed';
  select count(*) into v_source_stats from public.league_player_match_stats;
  select count(distinct public.atheus_normalize_player_name(player_name))
  into v_source_players
  from public.league_player_match_stats;

  select count(*)
  into v_invalid_teams
  from public.league_teams team
  where team.id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or btrim(team.name) = ''
    or char_length(btrim(team.abbreviation)) not between 2 and 8
    or btrim(team.ea_club_id) = '';

  select count(*)
  into v_invalid_fixtures
  from public.league_fixtures fixture
  left join public.league_teams home_team on home_team.id = fixture.home_team_id
  left join public.league_teams away_team on away_team.id = fixture.away_team_id
  where home_team.id is null
    or away_team.id is null
    or fixture.home_team_id = fixture.away_team_id
    or (fixture.status = 'completed'
      and (fixture.home_score is null or fixture.away_score is null))
    or fixture.kickoff_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$';

  select count(*)
  into v_invalid_stats
  from public.league_player_match_stats stat
  left join public.league_fixtures fixture on fixture.id = stat.fixture_id
  left join public.league_teams team on team.id = stat.team_id
  where fixture.id is null
    or team.id is null
    or public.atheus_normalize_player_name(stat.player_name) = ''
    or stat.goals < 0
    or stat.assists < 0
    or stat.rating < 0
    or stat.rating > 10
    or stat.shots < 0
    or stat.passes_made < 0
    or stat.pass_attempts < 0
    or stat.tackles_made < 0
    or stat.red_cards < 0
    or stat.saves < 0;

  if v_source_teams < 2 then
    raise exception 'The legacy VXN source has fewer than two teams.';
  end if;

  if v_source_fixtures = 0 then
    raise exception 'The legacy VXN source has no fixtures.';
  end if;

  if v_invalid_teams > 0
    or v_invalid_fixtures > 0
    or v_invalid_stats > 0 then
    raise exception 'Legacy VXN validation failed: % invalid teams, % invalid fixtures and % invalid stat rows.',
      v_invalid_teams,
      v_invalid_fixtures,
      v_invalid_stats;
  end if;

  select id
  into v_league_id
  from public.leagues
  where slug = 'vxn';

  if exists (
    select 1
    from public.league_discord_guilds guild
    where guild.discord_guild_id = btrim(p_discord_guild_id)
      and guild.unlinked_at is null
      and (v_league_id is null or guild.league_id <> v_league_id)
  ) then
    raise exception 'The VXN Discord guild is already linked to another league.';
  end if;

  if v_league_id is not null and exists (
    select 1
    from public.league_memberships membership
    where membership.league_id = v_league_id
      and membership.active
      and membership.role = 'owner'
      and membership.discord_user_id <> btrim(p_owner_discord_user_id)
  ) then
    raise exception 'The existing VXN league has a different active owner.';
  end if;

  v_result := jsonb_build_object(
    'mode', case when p_apply then 'apply' else 'dry-run' end,
    'source', jsonb_build_object(
      'teams', v_source_teams,
      'fixtures', v_source_fixtures,
      'completed_fixtures', v_source_completed,
      'player_stat_rows', v_source_stats,
      'players', v_source_players
    ),
    'validation', jsonb_build_object(
      'invalid_teams', v_invalid_teams,
      'invalid_fixtures', v_invalid_fixtures,
      'invalid_stat_rows', v_invalid_stats
    ),
    'existing_league_id', v_league_id
  );

  if not p_apply then
    return v_result;
  end if;

  perform pg_advisory_xact_lock(hashtext('atheus:legacy-vxn-canonical-import'));

  if v_league_id is null then
    insert into public.leagues (
      slug,
      name,
      short_name,
      description,
      status,
      timezone,
      default_platform,
      created_by_discord_user_id,
      activated_at
    )
    values (
      'vxn',
      'VXN League',
      'VXN',
      'Competitive FC Clubs league.',
      'active',
      'Europe/London',
      'common-gen5',
      btrim(p_owner_discord_user_id),
      now()
    )
    returning id into v_league_id;
  else
    update public.leagues
    set name = 'VXN League',
        short_name = 'VXN',
        description = 'Competitive FC Clubs league.',
        status = 'active',
        timezone = 'Europe/London',
        default_platform = 'common-gen5',
        activated_at = coalesce(activated_at, now()),
        updated_at = now()
    where id = v_league_id;
  end if;

  insert into public.league_memberships (
    league_id,
    discord_user_id,
    role,
    active
  )
  values (
    v_league_id,
    btrim(p_owner_discord_user_id),
    'owner',
    true
  )
  on conflict (league_id, discord_user_id) do update
  set role = 'owner',
      active = true,
      updated_at = now();

  insert into public.league_discord_guilds (
    league_id,
    discord_guild_id,
    is_primary,
    linked_by_discord_user_id
  )
  values (
    v_league_id,
    btrim(p_discord_guild_id),
    true,
    btrim(p_owner_discord_user_id)
  )
  on conflict (discord_guild_id) where unlinked_at is null do update
  set is_primary = true,
      linked_by_discord_user_id = excluded.linked_by_discord_user_id;

  update public.league_branding
  set primary_colour = '#8B5CFF',
      secondary_colour = '#0A0C1F',
      accent_colour = '#5CC6FF',
      background_colour = '#03040B',
      surface_colour = '#11142D',
      text_colour = '#F1F1FF',
      muted_text_colour = '#A8A9C2',
      updated_at = now()
  where league_id = v_league_id;

  update public.league_settings
  set review_mode = 'manual',
      default_match_type = 'leagueMatch',
      default_platform = 'common-gen5',
      collector_enabled = false,
      public_stats_enabled = true,
      updated_at = now()
  where league_id = v_league_id;

  insert into public.platform_entitlements (
    discord_user_id,
    plan,
    free_claimed_at,
    free_league_id
  )
  values (
    btrim(p_owner_discord_user_id),
    'free',
    now(),
    v_league_id
  )
  on conflict (discord_user_id) do update
  set free_claimed_at = coalesce(
        public.platform_entitlements.free_claimed_at,
        excluded.free_claimed_at
      ),
      free_league_id = coalesce(
        public.platform_entitlements.free_league_id,
        excluded.free_league_id
      ),
      updated_at = now();

  select id
  into v_season_id
  from public.seasons
  where league_id = v_league_id
    and slug = 'season-3';

  if v_season_id is null then
    insert into public.seasons (
      league_id,
      name,
      slug,
      status,
      starts_on,
      ends_on
    )
    select
      v_league_id,
      'Season 3',
      'season-3',
      'active',
      min(fixture_date),
      max(fixture_date)
    from public.league_fixtures
    returning id into v_season_id;
  else
    update public.seasons
    set name = 'Season 3',
        status = 'active',
        starts_on = source_dates.starts_on,
        ends_on = source_dates.ends_on,
        updated_at = now()
    from (
      select min(fixture_date) starts_on, max(fixture_date) ends_on
      from public.league_fixtures
    ) source_dates
    where id = v_season_id;
  end if;

  insert into public.competitions (
    league_id,
    season_id,
    name,
    slug,
    kind,
    active
  )
  values (
    v_league_id,
    v_season_id,
    'League',
    'league',
    'league',
    true
  )
  on conflict (league_id, season_id, slug) do update
  set name = excluded.name,
      kind = excluded.kind,
      active = true,
      updated_at = now()
  returning id into v_league_competition_id;

  insert into public.competitions (
    league_id,
    season_id,
    name,
    slug,
    kind,
    active
  )
  values (
    v_league_id,
    v_season_id,
    'Cup',
    'cup',
    'cup',
    true
  )
  on conflict (league_id, season_id, slug) do update
  set name = excluded.name,
      kind = excluded.kind,
      active = true,
      updated_at = now()
  returning id into v_cup_competition_id;

  insert into public.league_schedule_slots (
    league_id,
    season_id,
    competition_id,
    weekday,
    local_kickoff_time,
    active
  )
  select distinct
    v_league_id,
    v_season_id,
    null::uuid,
    extract(dow from fixture_date)::smallint,
    kickoff_time::time,
    true
  from public.league_fixtures
  on conflict (league_id, season_id, weekday, local_kickoff_time) do update
  set active = true,
      updated_at = now();

  insert into public.teams (
    league_id,
    name,
    slug,
    abbreviation,
    status,
    logo_url,
    primary_colour,
    secondary_colour
  )
  select
    v_league_id,
    btrim(source_team.name),
    source_team.id,
    upper(btrim(source_team.abbreviation)),
    case when source_team.active then 'active' else 'inactive' end,
    source_team.logo_url,
    case
      when source_team.primary_color ~ '^#[0-9A-Fa-f]{6}$'
        then upper(source_team.primary_color)
      else null
    end,
    case
      when source_team.secondary_color ~ '^#[0-9A-Fa-f]{6}$'
        then upper(source_team.secondary_color)
      else null
    end
  from public.league_teams source_team
  on conflict (league_id, slug) do update
  set name = excluded.name,
      abbreviation = excluded.abbreviation,
      status = excluded.status,
      logo_url = excluded.logo_url,
      primary_colour = excluded.primary_colour,
      secondary_colour = excluded.secondary_colour,
      updated_at = now();

  update public.team_ea_club_links existing
  set inactive_at = now()
  from public.league_teams source_team
  join public.teams target_team
    on target_team.league_id = v_league_id
   and target_team.slug = source_team.id
  where existing.league_id = v_league_id
    and existing.team_id = target_team.id
    and existing.platform = 'common-gen5'
    and existing.inactive_at is null
    and existing.ea_club_id <> btrim(source_team.ea_club_id);

  insert into public.team_ea_club_links (
    league_id,
    team_id,
    ea_club_id,
    ea_club_name,
    platform,
    generation,
    active_from,
    verified_at,
    linked_by_discord_user_id,
    verification_snapshot
  )
  select
    v_league_id,
    target_team.id,
    btrim(source_team.ea_club_id),
    btrim(source_team.name),
    'common-gen5',
    'gen5',
    source_team.created_at,
    now(),
    btrim(p_owner_discord_user_id),
    jsonb_build_object(
      'source', 'legacy_vxn',
      'legacy_team_id', source_team.id
    )
  from public.league_teams source_team
  join public.teams target_team
    on target_team.league_id = v_league_id
   and target_team.slug = source_team.id
  where not exists (
    select 1
    from public.team_ea_club_links existing
    where existing.league_id = v_league_id
      and existing.team_id = target_team.id
      and existing.platform = 'common-gen5'
      and existing.inactive_at is null
  );

  insert into public.fixtures (
    league_id,
    season_id,
    competition_id,
    external_fixture_key,
    round_label,
    kickoff_at,
    home_team_id,
    away_team_id,
    status,
    home_score,
    away_score,
    result_source,
    published_at
  )
  select
    v_league_id,
    v_season_id,
    case
      when source_fixture.competition = 'Cup' then v_cup_competition_id
      else v_league_competition_id
    end,
    'legacy-vxn:' || source_fixture.id,
    source_fixture.competition,
    (
      source_fixture.fixture_date::text || ' ' || source_fixture.kickoff_time
    )::timestamp at time zone 'Europe/London',
    home_team.id,
    away_team.id,
    case source_fixture.status
      when 'completed' then 'completed'
      when 'pending-approval' then 'pending_review'
      else 'scheduled'
    end,
    source_fixture.home_score,
    source_fixture.away_score,
    case
      when source_fixture.status = 'completed' then 'legacy_vxn'
      else null
    end,
    coalesce(
      source_fixture.updated_at,
      source_fixture.created_at,
      now()
    )
  from public.league_fixtures source_fixture
  join public.teams home_team
    on home_team.league_id = v_league_id
   and home_team.slug = source_fixture.home_team_id
  join public.teams away_team
    on away_team.league_id = v_league_id
   and away_team.slug = source_fixture.away_team_id
  on conflict (league_id, external_fixture_key)
    where external_fixture_key is not null
  do update
  set season_id = excluded.season_id,
      competition_id = excluded.competition_id,
      round_label = excluded.round_label,
      kickoff_at = excluded.kickoff_at,
      home_team_id = excluded.home_team_id,
      away_team_id = excluded.away_team_id,
      status = excluded.status,
      home_score = excluded.home_score,
      away_score = excluded.away_score,
      result_source = excluded.result_source,
      published_at = excluded.published_at,
      updated_at = now();

  insert into public.matches (
    league_id,
    fixture_id,
    home_score,
    away_score,
    result_source,
    approved_by_discord_user_id,
    approved_at
  )
  select
    v_league_id,
    target_fixture.id,
    source_fixture.home_score,
    source_fixture.away_score,
    'legacy_vxn',
    btrim(p_owner_discord_user_id),
    coalesce(source_fixture.updated_at, now())
  from public.league_fixtures source_fixture
  join public.fixtures target_fixture
    on target_fixture.league_id = v_league_id
   and target_fixture.external_fixture_key = 'legacy-vxn:' || source_fixture.id
  where source_fixture.status = 'completed'
    and source_fixture.home_score is not null
    and source_fixture.away_score is not null
  on conflict (fixture_id) do update
  set home_score = excluded.home_score,
      away_score = excluded.away_score,
      result_source = excluded.result_source,
      approved_by_discord_user_id = excluded.approved_by_discord_user_id,
      approved_at = excluded.approved_at,
      updated_at = now();

  insert into public.player_identities (
    league_id,
    canonical_name,
    normalized_name,
    current_team_id
  )
  select
    v_league_id,
    latest.player_name,
    latest.normalized_name,
    target_team.id
  from (
    select distinct on (public.atheus_normalize_player_name(stat.player_name))
      stat.player_name,
      stat.team_id,
      public.atheus_normalize_player_name(stat.player_name) normalized_name
    from public.league_player_match_stats stat
    order by
      public.atheus_normalize_player_name(stat.player_name),
      stat.fixture_date desc,
      stat.id desc
  ) latest
  join public.teams target_team
    on target_team.league_id = v_league_id
   and target_team.slug = latest.team_id
  on conflict (league_id, normalized_name) do update
  set canonical_name = excluded.canonical_name,
      current_team_id = excluded.current_team_id,
      updated_at = now();

  insert into public.player_aliases (
    league_id,
    player_identity_id,
    alias,
    normalized_alias,
    source
  )
  select distinct on (identity.normalized_name)
    v_league_id,
    identity.id,
    identity.canonical_name,
    identity.normalized_name,
    'legacy_vxn'
  from public.player_identities identity
  where identity.league_id = v_league_id
  on conflict (league_id, normalized_alias) do update
  set player_identity_id = excluded.player_identity_id,
      alias = excluded.alias,
      source = excluded.source;

  insert into public.player_match_stats (
    league_id,
    match_id,
    team_id,
    player_identity_id,
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
    clean_sheet
  )
  select
    v_league_id,
    target_match.id,
    target_team.id,
    identity.id,
    source_stat.position,
    source_stat.goals,
    source_stat.assists,
    source_stat.rating,
    source_stat.shots,
    source_stat.passes_made,
    source_stat.pass_attempts,
    case
      when source_stat.pass_attempts > 0
        then round(
          (source_stat.passes_made::numeric / source_stat.pass_attempts::numeric) * 100,
          2
        )
      else null
    end,
    source_stat.tackles_made,
    source_stat.saves,
    source_stat.red_cards,
    case
      when upper(coalesce(source_stat.position, '')) in ('GK', 'GOALKEEPER')
        then case
          when source_stat.team_id = source_fixture.home_team_id
            then source_fixture.away_score = 0
          when source_stat.team_id = source_fixture.away_team_id
            then source_fixture.home_score = 0
          else false
        end
      else false
    end
  from public.league_player_match_stats source_stat
  join public.league_fixtures source_fixture
    on source_fixture.id = source_stat.fixture_id
  join public.fixtures target_fixture
    on target_fixture.league_id = v_league_id
   and target_fixture.external_fixture_key = 'legacy-vxn:' || source_stat.fixture_id
  join public.matches target_match
    on target_match.league_id = v_league_id
   and target_match.fixture_id = target_fixture.id
  join public.teams target_team
    on target_team.league_id = v_league_id
   and target_team.slug = source_stat.team_id
  join public.player_identities identity
    on identity.league_id = v_league_id
   and identity.normalized_name =
     public.atheus_normalize_player_name(source_stat.player_name)
  on conflict (league_id, match_id, player_identity_id) do update
  set team_id = excluded.team_id,
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
      clean_sheet = excluded.clean_sheet,
      updated_at = now();

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
    btrim(p_owner_discord_user_id),
    'league.legacy_vxn_imported',
    'league',
    v_league_id,
    jsonb_build_object(
      'teams', v_source_teams,
      'fixtures', v_source_fixtures,
      'completed_fixtures', v_source_completed,
      'player_stat_rows', v_source_stats,
      'players', v_source_players
    )
  );

  return v_result || jsonb_build_object(
    'league_id', v_league_id,
    'season_id', v_season_id,
    'target', jsonb_build_object(
      'teams', (
        select count(*) from public.teams where league_id = v_league_id
      ),
      'fixtures', (
        select count(*) from public.fixtures where league_id = v_league_id
      ),
      'matches', (
        select count(*) from public.matches where league_id = v_league_id
      ),
      'player_stat_rows', (
        select count(*) from public.player_match_stats where league_id = v_league_id
      ),
      'players', (
        select count(*) from public.player_identities where league_id = v_league_id
      )
    )
  );
end;
$$;

revoke all on function public.import_legacy_vxn_canonical(text, text, boolean)
from public, anon, authenticated;

grant execute on function public.import_legacy_vxn_canonical(text, text, boolean)
to service_role;

commit;

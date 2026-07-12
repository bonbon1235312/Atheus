begin;

-- Legacy mirror tables contain Discord IDs, moderation data, finances, and
-- transaction history. Browser roles receive no direct access to them.
create table if not exists public.league_bot_public_guilds (
  guild_id bigint primary key,
  published_by text not null,
  published_at timestamptz not null default now(),
  constraint league_bot_public_guild_publisher_not_blank
    check (btrim(published_by) <> '')
);

alter table public.league_bot_public_guilds enable row level security;
alter table public.league_bot_public_guilds force row level security;
revoke all on table public.league_bot_public_guilds
  from public, anon, authenticated;
grant select, insert, update, delete on table public.league_bot_public_guilds
  to service_role;

do $$
declare
  v_table_name text;
  v_view_name text;
begin
  foreach v_table_name in array array[
    'league_bot_guild_settings',
    'league_bot_teams',
    'league_bot_team_members',
    'league_bot_loans',
    'league_bot_transactions',
    'league_bot_gamertags',
    'league_bot_advertisements',
    'league_bot_advertisement_offers',
    'league_bot_warnings',
    'league_bot_coins'
  ]
  loop
    if to_regclass(format('public.%I', v_table_name)) is not null then
      execute format(
        'alter table public.%I enable row level security',
        v_table_name
      );
      execute format(
        'alter table public.%I force row level security',
        v_table_name
      );
      execute format(
        'revoke all on table public.%I from public, anon, authenticated',
        v_table_name
      );
      execute format(
        'grant select, insert, update, delete on table public.%I to service_role',
        v_table_name
      );
    end if;
  end loop;

  foreach v_view_name in array array[
    'league_bot_roster_view',
    'league_bot_active_loans_view',
    'league_bot_transfer_market_view',
    'league_bot_activity_log'
  ]
  loop
    if to_regclass(format('public.%I', v_view_name)) is not null then
      execute format(
        'alter view public.%I set (security_invoker = true)',
        v_view_name
      );
      execute format(
        'revoke all on table public.%I from public, anon, authenticated',
        v_view_name
      );
      execute format(
        'grant select on table public.%I to service_role',
        v_view_name
      );
    end if;
  end loop;

  if to_regclass('public.league_bot_guild_settings') is not null then
    execute $legacy_view$
      create or replace view public.league_bot_public_leagues
      with (security_barrier = true)
      as
      select
        settings.guild_id,
        settings.league_name,
        settings.season_name,
        settings.updated_at
      from public.league_bot_guild_settings settings
      join public.league_bot_public_guilds published
        on published.guild_id = settings.guild_id
    $legacy_view$;

    execute
      'revoke all on table public.league_bot_public_leagues from public, anon, authenticated';
    execute
      'grant select on table public.league_bot_public_leagues to anon, authenticated';
    execute
      'comment on view public.league_bot_public_leagues is '
      || quote_literal(
        'Sanitized league names for guilds explicitly published by a trusted service.'
      );
  end if;

  if to_regclass('public.league_bot_teams') is not null then
    execute $legacy_view$
      create or replace view public.league_bot_public_team_standings
      with (security_barrier = true)
      as
      select
        team.guild_id,
        team.id as team_id,
        team.name as team_name,
        team.wins,
        team.losses,
        team.draws,
        team.table_position,
        team.titles,
        team.updated_at
      from public.league_bot_teams team
      join public.league_bot_public_guilds published
        on published.guild_id = team.guild_id
    $legacy_view$;

    execute
      'revoke all on table public.league_bot_public_team_standings from public, anon, authenticated';
    execute
      'grant select on table public.league_bot_public_team_standings to anon, authenticated';
    execute
      'comment on view public.league_bot_public_team_standings is '
      || quote_literal(
        'Sanitized team standings for guilds explicitly published by a trusted service.'
      );
  end if;
end;
$$;

comment on table public.league_bot_public_guilds is
  'Service-managed opt-in registry for legacy guild summaries that are safe for public access.';

-- Reject ambiguous historical EA match identities before installing the
-- normalized durable key. No historical row is silently discarded.
do $$
begin
  if exists (
    select 1
    from public.match_imports
    where nullif(btrim(ea_match_id), '') is not null
    group by
      league_id,
      lower(coalesce(nullif(btrim(platform), ''), 'unknown')),
      lower(coalesce(nullif(btrim(match_type), ''), 'unknown')),
      btrim(ea_match_id)
    having count(*) > 1
  ) then
    raise exception
      'Duplicate league/platform/match_type/EA match IDs must be reconciled before this migration.';
  end if;
end;
$$;

create unique index if not exists match_imports_ea_identity_uidx
  on public.match_imports (
    league_id,
    lower(coalesce(nullif(btrim(platform), ''), 'unknown')),
    lower(coalesce(nullif(btrim(match_type), ''), 'unknown')),
    btrim(ea_match_id)
  )
  where nullif(btrim(ea_match_id), '') is not null;

create table if not exists public.player_external_identities (
  league_id uuid not null references public.leagues(id) on delete cascade,
  platform text not null,
  ea_player_id text not null,
  player_identity_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (league_id, platform, ea_player_id),
  constraint player_external_identity_player_fk
    foreign key (league_id, player_identity_id)
    references public.player_identities(league_id, id) on delete restrict,
  constraint player_external_identity_platform_normalized
    check (platform = lower(btrim(platform)) and platform <> ''),
  constraint player_external_identity_ea_id_normalized
    check (ea_player_id = btrim(ea_player_id) and ea_player_id <> '')
);

create or replace function public.atheus_reject_external_player_identity_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using
    errcode = '23514',
    message = 'External EA player identity mappings are immutable.';
end;
$$;

drop trigger if exists player_external_identities_immutable
  on public.player_external_identities;
create trigger player_external_identities_immutable
before update on public.player_external_identities
for each row execute function public.atheus_reject_external_player_identity_update();

alter table public.player_external_identities enable row level security;
alter table public.player_external_identities force row level security;
revoke all on table public.player_external_identities
  from public, anon, authenticated;
grant select, insert on table public.player_external_identities
  to service_role;
revoke all on function public.atheus_reject_external_player_identity_update()
  from public, anon, authenticated, service_role;

-- Existing approved rows can establish a mapping only when every occurrence of
-- an EA ID already points to one canonical player.
do $$
begin
  if exists (
    select 1
    from public.player_match_stats stats
    join public.match_import_player_rows import_row
      on import_row.league_id = stats.league_id
      and import_row.id = stats.source_import_row_id
    join public.match_imports import
      on import.league_id = import_row.league_id
      and import.id = import_row.match_import_id
    where nullif(btrim(import.platform), '') is not null
      and nullif(btrim(import_row.ea_player_id), '') is not null
    group by
      stats.league_id,
      lower(btrim(import.platform)),
      btrim(import_row.ea_player_id)
    having count(distinct stats.player_identity_id) > 1
  ) then
    raise exception
      'Historical EA player IDs map to multiple player identities and require reconciliation.';
  end if;
end;
$$;

insert into public.player_external_identities (
  league_id,
  platform,
  ea_player_id,
  player_identity_id
)
select distinct
  stats.league_id,
  lower(btrim(import.platform)),
  btrim(import_row.ea_player_id),
  stats.player_identity_id
from public.player_match_stats stats
join public.match_import_player_rows import_row
  on import_row.league_id = stats.league_id
  and import_row.id = stats.source_import_row_id
join public.match_imports import
  on import.league_id = import_row.league_id
  and import.id = import_row.match_import_id
where nullif(btrim(import.platform), '') is not null
  and nullif(btrim(import_row.ea_player_id), '') is not null
on conflict (league_id, platform, ea_player_id) do nothing;

comment on table public.player_external_identities is
  'Immutable league- and platform-scoped EA player ID mapping; display names remain aliases.';

drop function if exists public.ingest_match_import(
  text, uuid, uuid, uuid, text, text, text, text, timestamptz,
  integer, integer, jsonb, jsonb, jsonb, boolean, text
);

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

revoke all on function public.ingest_match_import(
  text, uuid, uuid, uuid, text, text, text, text, timestamptz,
  integer, integer, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.ingest_match_import(
  text, uuid, uuid, uuid, text, text, text, text, timestamptz,
  integer, integer, jsonb, jsonb, jsonb
) to service_role;
comment on function public.ingest_match_import(
  text, uuid, uuid, uuid, text, text, text, text, timestamptz,
  integer, integer, jsonb, jsonb, jsonb
) is
  'Stores one durable EA match package; empty player arrays remain pending for explicit human override.';

drop function if exists public.approve_match_import(
  uuid, uuid, text, text
);

create or replace function public.approve_match_import(
  p_league_id uuid,
  p_import_id uuid,
  p_discord_user_id text,
  p_review_note text default null,
  p_score_only_override boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_import public.match_imports%rowtype;
  v_fixture public.fixtures%rowtype;
  v_match_id uuid;
  v_row public.match_import_player_rows%rowtype;
  v_identity_id uuid;
  v_mapped_identity_id uuid;
  v_alias_owner_id uuid;
  v_candidate_ids uuid[];
  v_platform text;
  v_ea_player_id text;
  v_player_row_count integer;
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

  select count(*)::integer
  into v_player_row_count
  from public.match_import_player_rows
  where league_id = p_league_id
    and match_import_id = p_import_id;

  if v_player_row_count = 0 then
    if not coalesce(p_score_only_override, false) then
      raise exception 'Score-only imports require an explicit administrative override.';
    end if;

    if btrim(coalesce(p_review_note, '')) = '' then
      raise exception 'A score-only override reason is required.';
    end if;

    if not exists (
      select 1
      from public.league_memberships
      where league_id = p_league_id
        and discord_user_id = p_discord_user_id
        and active
        and role in ('owner', 'admin')
    ) then
      raise exception 'League owner or admin access is required for a score-only override.';
    end if;
  elsif coalesce(p_score_only_override, false) then
    raise exception 'Score-only override cannot be used when player rows exist.';
  end if;

  v_platform := lower(btrim(coalesce(v_import.platform, '')));

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

  if v_player_row_count = 0 then
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
      'match_import.score_only_override',
      'match_import',
      p_import_id,
      jsonb_build_object(
        'fixture_id', v_fixture.id,
        'home_score', v_import.home_score,
        'away_score', v_import.away_score,
        'player_row_count', v_player_row_count
      ),
      btrim(p_review_note)
    );
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

    v_identity_id := null;
    v_mapped_identity_id := null;
    v_alias_owner_id := null;
    v_candidate_ids := null;
    v_ea_player_id := nullif(btrim(coalesce(v_row.ea_player_id, '')), '');

    if v_ea_player_id is not null then
      if v_platform = '' then
        raise exception 'An EA platform is required for external player identity mapping.';
      end if;

      select external_identity.player_identity_id
      into v_identity_id
      from public.player_external_identities external_identity
      where external_identity.league_id = p_league_id
        and external_identity.platform = v_platform
        and external_identity.ea_player_id = v_ea_player_id;
    end if;

    if v_identity_id is null then
      select array_agg(candidate.player_identity_id order by candidate.player_identity_id)
      into v_candidate_ids
      from (
        select identity.id as player_identity_id
        from public.player_identities identity
        where identity.league_id = p_league_id
          and identity.normalized_name = v_row.normalized_gamertag

        union

        select alias.player_identity_id
        from public.player_aliases alias
        where alias.league_id = p_league_id
          and alias.normalized_alias = v_row.normalized_gamertag
      ) candidate;

      if coalesce(cardinality(v_candidate_ids), 0) > 1 then
        raise exception 'Gamertag resolves to multiple player identities.';
      end if;

      v_identity_id := v_candidate_ids[1];
    end if;

    if v_identity_id is null then
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
        current_team_id = excluded.current_team_id,
        updated_at = now()
      returning id into v_identity_id;
    else
      update public.player_identities
      set
        canonical_name = case
          when canonical_name like 'Discord %' then v_row.gamertag
          else canonical_name
        end,
        current_team_id = v_row.team_id,
        updated_at = now()
      where id = v_identity_id
        and league_id = p_league_id;
    end if;

    if v_ea_player_id is not null then
      insert into public.player_external_identities (
        league_id,
        platform,
        ea_player_id,
        player_identity_id
      )
      values (
        p_league_id,
        v_platform,
        v_ea_player_id,
        v_identity_id
      )
      on conflict (league_id, platform, ea_player_id) do nothing;

      select external_identity.player_identity_id
      into v_mapped_identity_id
      from public.player_external_identities external_identity
      where external_identity.league_id = p_league_id
        and external_identity.platform = v_platform
        and external_identity.ea_player_id = v_ea_player_id;

      if v_mapped_identity_id is distinct from v_identity_id then
        raise exception 'EA player ID is already mapped to another player identity.';
      end if;
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
      v_identity_id,
      v_row.gamertag,
      v_row.normalized_gamertag,
      'ea'
    )
    on conflict (league_id, normalized_alias) do nothing;

    select alias.player_identity_id
    into v_alias_owner_id
    from public.player_aliases alias
    where alias.league_id = p_league_id
      and alias.normalized_alias = v_row.normalized_gamertag;

    if v_alias_owner_id is distinct from v_identity_id then
      raise exception 'Gamertag alias is already assigned to another player identity.';
    end if;

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

revoke all on function public.approve_match_import(
  uuid, uuid, text, text, boolean
) from public, anon, authenticated;
grant execute on function public.approve_match_import(
  uuid, uuid, text, text, boolean
) to service_role;
comment on function public.approve_match_import(
  uuid, uuid, text, text, boolean
) is
  'Approves player-backed imports or owner/admin-authorized score-only candidates with transactional audit.';

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

revoke all on function public.merge_player_identities(
  uuid, uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.merge_player_identities(
  uuid, uuid, uuid, text, text
) to service_role;
comment on function public.merge_player_identities(
  uuid, uuid, uuid, text, text
) is
  'Consolidates duplicate identities while preserving immutable EA mappings on the target.';


drop function if exists public.atheus_mirror_discord_transaction(jsonb);

create or replace function public.atheus_mirror_discord_transaction(
  p_expected_league_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_guild_id text := btrim(coalesce(p_payload ->> 'discord_guild_id', ''));
  v_event_key text := btrim(coalesce(p_payload ->> 'source_event_key', ''));
  v_event_type text := lower(btrim(coalesce(p_payload ->> 'event_type', '')));
  v_player_discord_id text := btrim(coalesce(p_payload ->> 'player_discord_user_id', ''));
  v_player_name text := btrim(coalesce(p_payload ->> 'player_name', ''));
  v_normalized_name text;
  v_actor_id text := nullif(btrim(coalesce(p_payload ->> 'actor_discord_user_id', '')), '');
  v_league_id uuid;
  v_mapping_league_ids uuid[];
  v_mapping_count integer;
  v_season_id uuid;
  v_player_id uuid;
  v_source_team_id uuid;
  v_destination_team_id uuid;
  v_source_role_id text := nullif(btrim(coalesce(p_payload ->> 'source_team_role_id', '')), '');
  v_destination_role_id text := nullif(btrim(coalesce(p_payload ->> 'destination_team_role_id', '')), '');
  v_amount bigint := greatest(0, coalesce((p_payload ->> 'amount')::bigint, 0));
  v_expires_at timestamptz;
  v_event_id uuid;
  v_existing_event_id uuid;
begin
  if p_expected_league_id is null then
    raise exception 'p_expected_league_id is required';
  end if;
  if v_guild_id = '' then
    raise exception 'discord_guild_id is required';
  end if;
  if v_event_key = '' then
    raise exception 'source_event_key is required';
  end if;
  if v_event_type not in ('buy', 'sell', 'loan', 'recall', 'release') then
    raise exception 'unsupported event_type: %', v_event_type;
  end if;
  if v_player_discord_id = '' then
    raise exception 'player_discord_user_id is required';
  end if;
  if v_player_name = '' then
    v_player_name := 'Discord ' || v_player_discord_id;
  end if;

  select
    count(*)::integer,
    array_agg(mapping.league_id order by mapping.league_id)
  into v_mapping_count, v_mapping_league_ids
  from (
    select guild.league_id
    from public.league_discord_guilds guild
    where guild.discord_guild_id = v_guild_id
      and guild.unlinked_at is null
    union
    select team.league_id
    from public.teams team
    where team.discord_guild_id = v_guild_id
      and team.status = 'active'
  ) mapping;

  if v_mapping_count = 0 then
    raise exception 'Discord guild is not linked to an Atheus league';
  end if;
  if v_mapping_count <> 1 then
    raise exception 'Discord guild resolves to multiple Atheus leagues';
  end if;

  v_league_id := v_mapping_league_ids[1];
  if v_league_id <> p_expected_league_id then
    raise exception 'Discord guild league mapping does not match p_expected_league_id';
  end if;

  select id
  into v_season_id
  from public.seasons
  where league_id = v_league_id
  order by
    case status when 'active' then 0 when 'draft' then 1 else 2 end,
    starts_on desc nulls last,
    created_at desc
  limit 1;

  if v_season_id is null then
    raise exception 'League has no season for roster transaction';
  end if;

  select id
  into v_existing_event_id
  from public.transfer_events
  where league_id = v_league_id
    and source_event_key = v_event_key;

  if v_existing_event_id is not null then
    return jsonb_build_object(
      'event_id', v_existing_event_id,
      'league_id', v_league_id,
      'season_id', v_season_id,
      'idempotent', true
    );
  end if;

  if v_source_role_id is not null then
    select id into v_source_team_id
    from public.teams
    where league_id = v_league_id
      and discord_role_id = v_source_role_id
      and status = 'active';
    if v_source_team_id is null then
      raise exception 'Source Discord role is not linked to an active Atheus team';
    end if;
  end if;

  if v_destination_role_id is not null then
    select id into v_destination_team_id
    from public.teams
    where league_id = v_league_id
      and discord_role_id = v_destination_role_id
      and status = 'active';
    if v_destination_team_id is null then
      raise exception 'Destination Discord role is not linked to an active Atheus team';
    end if;
  end if;

  if v_event_type in ('buy', 'sell') and v_destination_team_id is null then
    raise exception 'Destination team is required for %', v_event_type;
  end if;
  if v_event_type in ('sell', 'loan', 'recall', 'release')
    and v_source_team_id is null then
    raise exception 'Source team is required for %', v_event_type;
  end if;
  if v_event_type in ('loan', 'recall') and v_destination_team_id is null then
    raise exception 'Destination team is required for %', v_event_type;
  end if;

  v_normalized_name := regexp_replace(lower(v_player_name), '[^a-z0-9]+', '', 'g');
  if v_normalized_name = '' then
    v_normalized_name := 'discord' || v_player_discord_id;
  end if;

  select id into v_player_id
  from public.player_identities
  where league_id = v_league_id
    and discord_user_id = v_player_discord_id;

  if v_player_id is null then
    select id into v_player_id
    from public.player_identities
    where league_id = v_league_id
      and normalized_name = v_normalized_name
      and discord_user_id is null;
  end if;

  if v_player_id is null then
    insert into public.player_identities (
      league_id,
      canonical_name,
      normalized_name,
      discord_user_id
    )
    values (
      v_league_id,
      v_player_name,
      v_normalized_name,
      v_player_discord_id
    )
    returning id into v_player_id;
  else
    update public.player_identities
    set
      discord_user_id = coalesce(discord_user_id, v_player_discord_id),
      canonical_name = case
        when canonical_name like 'Discord %' then v_player_name
        else canonical_name
      end,
      updated_at = now()
    where id = v_player_id;
  end if;

  if nullif(p_payload ->> 'expires_at', '') is not null then
    v_expires_at := (p_payload ->> 'expires_at')::timestamptz;
  end if;

  insert into public.transfer_events (
    league_id,
    season_id,
    event_type,
    player_identity_id,
    source_team_id,
    destination_team_id,
    amount,
    note,
    expires_at,
    actor_discord_user_id,
    source_event_key
  )
  values (
    v_league_id,
    v_season_id,
    v_event_type,
    v_player_id,
    v_source_team_id,
    v_destination_team_id,
    v_amount,
    nullif(btrim(coalesce(p_payload ->> 'note', '')), ''),
    v_expires_at,
    v_actor_id,
    v_event_key
  )
  returning id into v_event_id;

  if v_event_type in ('buy', 'sell') then
    update public.roster_memberships
    set
      status = 'transferred',
      left_at = now(),
      updated_at = now()
    where league_id = v_league_id
      and season_id = v_season_id
      and player_identity_id = v_player_id
      and status = 'active'
      and left_at is null;

    insert into public.roster_memberships (
      league_id,
      season_id,
      team_id,
      player_identity_id,
      source_event_key
    )
    values (
      v_league_id,
      v_season_id,
      v_destination_team_id,
      v_player_id,
      v_event_key
    );

    update public.player_identities
    set current_team_id = v_destination_team_id, updated_at = now()
    where id = v_player_id;
  elsif v_event_type = 'release' then
    update public.roster_memberships
    set
      status = 'released',
      left_at = now(),
      updated_at = now()
    where league_id = v_league_id
      and season_id = v_season_id
      and player_identity_id = v_player_id
      and status = 'active'
      and left_at is null;

    update public.player_loans
    set status = 'cancelled', ended_at = now(), updated_at = now()
    where league_id = v_league_id
      and season_id = v_season_id
      and player_identity_id = v_player_id
      and status = 'active'
      and ended_at is null;

    update public.player_identities
    set current_team_id = null, updated_at = now()
    where id = v_player_id;
  elsif v_event_type = 'loan' then
    insert into public.player_loans (
      league_id,
      season_id,
      player_identity_id,
      source_team_id,
      destination_team_id,
      expires_at,
      note,
      created_by_discord_user_id,
      source_event_key
    )
    values (
      v_league_id,
      v_season_id,
      v_player_id,
      v_source_team_id,
      v_destination_team_id,
      v_expires_at,
      nullif(btrim(coalesce(p_payload ->> 'note', '')), ''),
      v_actor_id,
      v_event_key
    );
  elsif v_event_type = 'recall' then
    update public.player_loans
    set status = 'recalled', ended_at = now(), updated_at = now()
    where league_id = v_league_id
      and season_id = v_season_id
      and player_identity_id = v_player_id
      and source_team_id = v_source_team_id
      and destination_team_id = v_destination_team_id
      and status = 'active'
      and ended_at is null;
  end if;

  if p_payload ? 'source_team_budget'
    and v_source_team_id is not null
    and (p_payload ->> 'source_team_budget') is not null then
    insert into public.team_finances (
      league_id,
      season_id,
      team_id,
      opening_budget,
      budget
    )
    values (
      v_league_id,
      v_season_id,
      v_source_team_id,
      greatest(0, (p_payload ->> 'source_team_budget')::bigint),
      greatest(0, (p_payload ->> 'source_team_budget')::bigint)
    )
    on conflict (league_id, season_id, team_id) do update
    set budget = excluded.budget, updated_at = now();
  end if;

  if p_payload ? 'destination_team_budget'
    and v_destination_team_id is not null
    and (p_payload ->> 'destination_team_budget') is not null then
    insert into public.team_finances (
      league_id,
      season_id,
      team_id,
      opening_budget,
      budget
    )
    values (
      v_league_id,
      v_season_id,
      v_destination_team_id,
      greatest(0, (p_payload ->> 'destination_team_budget')::bigint),
      greatest(0, (p_payload ->> 'destination_team_budget')::bigint)
    )
    on conflict (league_id, season_id, team_id) do update
    set budget = excluded.budget, updated_at = now();
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
    v_league_id,
    v_actor_id,
    'discord.transaction.mirrored',
    'transfer_event',
    v_event_id::text,
    jsonb_build_object(
      'source_event_key', v_event_key,
      'event_type', v_event_type,
      'player_discord_user_id', v_player_discord_id
    )
  );

  return jsonb_build_object(
    'event_id', v_event_id,
    'league_id', v_league_id,
    'season_id', v_season_id,
    'player_identity_id', v_player_id,
    'idempotent', false
  );
end;
$$;

revoke all on function public.atheus_mirror_discord_transaction(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.atheus_mirror_discord_transaction(uuid, jsonb)
  to service_role;
comment on function public.atheus_mirror_discord_transaction(uuid, jsonb) is
  'Atomically mirrors one completed local Discord transaction after exact expected-league validation.';

drop function if exists public.atheus_sync_discord_roster_snapshot(jsonb);

create or replace function public.atheus_sync_discord_roster_snapshot(
  p_expected_league_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_guild_id text := btrim(coalesce(p_payload ->> 'discord_guild_id', ''));
  v_league_id uuid;
  v_mapping_league_ids uuid[];
  v_mapping_count integer;
  v_season_id uuid;
  v_team jsonb;
  v_member jsonb;
  v_loan jsonb;
  v_team_id uuid;
  v_source_team_id uuid;
  v_destination_team_id uuid;
  v_player_id uuid;
  v_player_name text;
  v_player_discord_id text;
  v_normalized_name text;
  v_team_ids uuid[] := array[]::uuid[];
  v_player_ids uuid[] := array[]::uuid[];
  v_loan_keys text[] := array[]::text[];
  v_team_count integer := 0;
  v_player_count integer := 0;
  v_loan_count integer := 0;
begin
  if p_expected_league_id is null then
    raise exception 'p_expected_league_id is required';
  end if;
  if v_guild_id = '' then
    raise exception 'discord_guild_id is required';
  end if;
  if jsonb_typeof(coalesce(p_payload -> 'teams', '[]'::jsonb)) <> 'array' then
    raise exception 'teams must be a JSON array';
  end if;
  if jsonb_typeof(coalesce(p_payload -> 'loans', '[]'::jsonb)) <> 'array' then
    raise exception 'loans must be a JSON array';
  end if;

  select
    count(*)::integer,
    array_agg(mapping.league_id order by mapping.league_id)
  into v_mapping_count, v_mapping_league_ids
  from (
    select guild.league_id
    from public.league_discord_guilds guild
    where guild.discord_guild_id = v_guild_id
      and guild.unlinked_at is null
    union
    select team.league_id
    from public.teams team
    where team.discord_guild_id = v_guild_id
      and team.status = 'active'
  ) mapping;

  if v_mapping_count = 0 then
    raise exception 'Discord guild is not linked to an Atheus league';
  end if;
  if v_mapping_count <> 1 then
    raise exception 'Discord guild resolves to multiple Atheus leagues';
  end if;

  v_league_id := v_mapping_league_ids[1];
  if v_league_id <> p_expected_league_id then
    raise exception 'Discord guild league mapping does not match p_expected_league_id';
  end if;

  select id
  into v_season_id
  from public.seasons
  where league_id = v_league_id
  order by
    case status when 'active' then 0 when 'draft' then 1 else 2 end,
    starts_on desc nulls last,
    created_at desc
  limit 1;

  if v_season_id is null then
    raise exception 'League has no season for roster snapshot';
  end if;

  for v_team in
    select value from jsonb_array_elements(coalesce(p_payload -> 'teams', '[]'::jsonb))
  loop
    select id
    into v_team_id
    from public.teams
    where league_id = v_league_id
      and discord_role_id = btrim(coalesce(v_team ->> 'discord_role_id', ''))
      and status = 'active';

    if v_team_id is null then
      raise exception 'Snapshot team role % is not linked to an active Atheus team',
        v_team ->> 'discord_role_id';
    end if;

    v_team_ids := array_append(v_team_ids, v_team_id);
    v_team_count := v_team_count + 1;

    insert into public.team_finances (
      league_id,
      season_id,
      team_id,
      opening_budget,
      budget
    )
    values (
      v_league_id,
      v_season_id,
      v_team_id,
      greatest(0, coalesce((v_team ->> 'budget')::bigint, 0)),
      greatest(0, coalesce((v_team ->> 'budget')::bigint, 0))
    )
    on conflict (league_id, season_id, team_id) do update
    set budget = excluded.budget, updated_at = now();

    if jsonb_typeof(coalesce(v_team -> 'members', '[]'::jsonb)) <> 'array' then
      raise exception 'members must be a JSON array';
    end if;

    for v_member in
      select value
      from jsonb_array_elements(coalesce(v_team -> 'members', '[]'::jsonb))
    loop
      v_player_discord_id := btrim(coalesce(v_member ->> 'discord_user_id', ''));
      v_player_name := btrim(coalesce(v_member ->> 'player_name', ''));
      if v_player_discord_id = '' then
        raise exception 'Snapshot member discord_user_id is required';
      end if;
      if v_player_name = '' then
        v_player_name := 'Discord ' || v_player_discord_id;
      end if;
      v_normalized_name := regexp_replace(
        lower(v_player_name),
        '[^a-z0-9]+',
        '',
        'g'
      );
      if v_normalized_name = '' then
        v_normalized_name := 'discord' || v_player_discord_id;
      end if;

      select id
      into v_player_id
      from public.player_identities
      where league_id = v_league_id
        and discord_user_id = v_player_discord_id;

      if v_player_id is null then
        select id
        into v_player_id
        from public.player_identities
        where league_id = v_league_id
          and normalized_name = v_normalized_name
          and discord_user_id is null;
      end if;

      if v_player_id is null then
        insert into public.player_identities (
          league_id,
          canonical_name,
          normalized_name,
          discord_user_id,
          current_team_id
        )
        values (
          v_league_id,
          v_player_name,
          v_normalized_name,
          v_player_discord_id,
          v_team_id
        )
        returning id into v_player_id;
      else
        update public.player_identities
        set
          discord_user_id = coalesce(discord_user_id, v_player_discord_id),
          canonical_name = case
            when canonical_name like 'Discord %' then v_player_name
            else canonical_name
          end,
          current_team_id = v_team_id,
          updated_at = now()
        where id = v_player_id;
      end if;

      v_player_ids := array_append(v_player_ids, v_player_id);
      v_player_count := v_player_count + 1;

      update public.roster_memberships
      set status = 'transferred', left_at = now(), updated_at = now()
      where league_id = v_league_id
        and season_id = v_season_id
        and player_identity_id = v_player_id
        and team_id <> v_team_id
        and status = 'active'
        and left_at is null;

      if not exists (
        select 1
        from public.roster_memberships
        where league_id = v_league_id
          and season_id = v_season_id
          and team_id = v_team_id
          and player_identity_id = v_player_id
          and status = 'active'
          and left_at is null
      ) then
        insert into public.roster_memberships (
          league_id,
          season_id,
          team_id,
          player_identity_id,
          is_manager,
          is_co_manager,
          strike_active,
          source,
          source_event_key
        )
        values (
          v_league_id,
          v_season_id,
          v_team_id,
          v_player_id,
          coalesce((v_member ->> 'is_manager')::boolean, false),
          coalesce((v_member ->> 'is_co_manager')::boolean, false),
          coalesce((v_member ->> 'strike_active')::boolean, false),
          'discord_snapshot',
          'sqlite:' || v_guild_id || ':member:' || v_player_discord_id
        );
      else
        update public.roster_memberships
        set
          is_manager = coalesce((v_member ->> 'is_manager')::boolean, false),
          is_co_manager = coalesce((v_member ->> 'is_co_manager')::boolean, false),
          strike_active = coalesce((v_member ->> 'strike_active')::boolean, false),
          updated_at = now()
        where league_id = v_league_id
          and season_id = v_season_id
          and team_id = v_team_id
          and player_identity_id = v_player_id
          and status = 'active'
          and left_at is null;
      end if;
    end loop;
  end loop;

  if cardinality(v_team_ids) > 0 then
    update public.roster_memberships
    set status = 'released', left_at = now(), updated_at = now()
    where league_id = v_league_id
      and season_id = v_season_id
      and team_id = any(v_team_ids)
      and status = 'active'
      and left_at is null
      and (
        cardinality(v_player_ids) = 0
        or not (player_identity_id = any(v_player_ids))
      );

    update public.player_identities identities
    set current_team_id = null, updated_at = now()
    where identities.league_id = v_league_id
      and identities.current_team_id = any(v_team_ids)
      and (
        cardinality(v_player_ids) = 0
        or not (identities.id = any(v_player_ids))
      );
  end if;

  for v_loan in
    select value from jsonb_array_elements(coalesce(p_payload -> 'loans', '[]'::jsonb))
  loop
    v_player_discord_id := btrim(coalesce(v_loan ->> 'player_discord_user_id', ''));
    select id into v_player_id
    from public.player_identities
    where league_id = v_league_id
      and discord_user_id = v_player_discord_id;

    select id into v_source_team_id
    from public.teams
    where league_id = v_league_id
      and discord_role_id = btrim(coalesce(v_loan ->> 'source_team_role_id', ''))
      and status = 'active';

    select id into v_destination_team_id
    from public.teams
    where league_id = v_league_id
      and discord_role_id = btrim(coalesce(v_loan ->> 'destination_team_role_id', ''))
      and status = 'active';

    if v_player_id is null
      or v_source_team_id is null
      or v_destination_team_id is null then
      raise exception 'Active loan snapshot contains an unresolved player or team';
    end if;

    v_loan_keys := array_append(
      v_loan_keys,
      btrim(coalesce(v_loan ->> 'source_event_key', ''))
    );
    v_loan_count := v_loan_count + 1;

    insert into public.player_loans (
      league_id,
      season_id,
      player_identity_id,
      source_team_id,
      destination_team_id,
      status,
      starts_at,
      expires_at,
      note,
      created_by_discord_user_id,
      source_event_key
    )
    values (
      v_league_id,
      v_season_id,
      v_player_id,
      v_source_team_id,
      v_destination_team_id,
      'active',
      coalesce((v_loan ->> 'starts_at')::timestamptz, now()),
      nullif(v_loan ->> 'expires_at', '')::timestamptz,
      nullif(btrim(coalesce(v_loan ->> 'note', '')), ''),
      nullif(btrim(coalesce(v_loan ->> 'created_by_discord_user_id', '')), ''),
      btrim(coalesce(v_loan ->> 'source_event_key', ''))
    )
    on conflict (league_id, source_event_key) do update
    set
      status = 'active',
      ended_at = null,
      expires_at = excluded.expires_at,
      note = excluded.note,
      updated_at = now();
  end loop;

  if cardinality(v_team_ids) > 0 then
    update public.player_loans
    set status = 'cancelled', ended_at = now(), updated_at = now()
    where league_id = v_league_id
      and season_id = v_season_id
      and source_team_id = any(v_team_ids)
      and status = 'active'
      and ended_at is null
      and source_event_key like 'sqlite:' || v_guild_id || ':loan:%'
      and (
        cardinality(v_loan_keys) = 0
        or not (source_event_key = any(v_loan_keys))
      );
  end if;

  insert into public.audit_logs (
    league_id,
    action,
    entity_type,
    entity_id,
    after_data
  )
  values (
    v_league_id,
    'discord.roster.snapshot',
    'league',
    v_league_id::text,
    jsonb_build_object(
      'discord_guild_id', v_guild_id,
      'season_id', v_season_id,
      'teams', v_team_count,
      'players', v_player_count,
      'loans', v_loan_count
    )
  );

  return jsonb_build_object(
    'league_id', v_league_id,
    'season_id', v_season_id,
    'teams', v_team_count,
    'players', v_player_count,
    'loans', v_loan_count
  );
end;
$$;

revoke all on function public.atheus_sync_discord_roster_snapshot(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.atheus_sync_discord_roster_snapshot(uuid, jsonb)
  to service_role;
comment on function public.atheus_sync_discord_roster_snapshot(uuid, jsonb) is
  'Idempotently reconciles one guild snapshot after exact expected-league validation.';

commit;

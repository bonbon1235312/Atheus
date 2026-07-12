-- Canonical roster, finance, loan, and transfer state for the Atheus platform.
-- The Discord bot keeps its proven SQLite workflow and mirrors completed local
-- transactions through the idempotent RPC at the bottom of this migration.

create table if not exists public.team_finances (
  league_id uuid not null,
  season_id uuid not null,
  team_id uuid not null,
  opening_budget bigint not null default 0 check (opening_budget >= 0),
  budget bigint not null default 0 check (budget >= 0),
  updated_at timestamptz not null default now(),
  primary key (league_id, season_id, team_id),
  constraint team_finances_season_fk
    foreign key (league_id, season_id)
    references public.seasons(league_id, id) on delete cascade,
  constraint team_finances_team_fk
    foreign key (league_id, team_id)
    references public.teams(league_id, id) on delete cascade
);

create table if not exists public.roster_memberships (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  team_id uuid not null,
  player_identity_id uuid not null,
  status text not null default 'active'
    check (status in ('active', 'released', 'transferred')),
  is_manager boolean not null default false,
  is_co_manager boolean not null default false,
  strike_active boolean not null default false,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  source text not null default 'discord_bot',
  source_event_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roster_memberships_season_fk
    foreign key (league_id, season_id)
    references public.seasons(league_id, id) on delete cascade,
  constraint roster_memberships_team_fk
    foreign key (league_id, team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint roster_memberships_player_fk
    foreign key (league_id, player_identity_id)
    references public.player_identities(league_id, id) on delete restrict,
  constraint roster_memberships_left_after_joined
    check (left_at is null or left_at >= joined_at),
  constraint roster_memberships_source_not_blank check (btrim(source) <> ''),
  unique (league_id, id)
);

create unique index if not exists roster_memberships_active_player_uidx
  on public.roster_memberships (league_id, season_id, player_identity_id)
  where left_at is null and status = 'active';

create index if not exists roster_memberships_team_idx
  on public.roster_memberships (league_id, season_id, team_id, joined_at);

create table if not exists public.player_loans (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  player_identity_id uuid not null,
  source_team_id uuid not null,
  destination_team_id uuid not null,
  status text not null default 'active'
    check (status in ('active', 'recalled', 'expired', 'cancelled')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  ended_at timestamptz,
  note text,
  created_by_discord_user_id text,
  source_event_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_loans_season_fk
    foreign key (league_id, season_id)
    references public.seasons(league_id, id) on delete cascade,
  constraint player_loans_player_fk
    foreign key (league_id, player_identity_id)
    references public.player_identities(league_id, id) on delete restrict,
  constraint player_loans_source_team_fk
    foreign key (league_id, source_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint player_loans_destination_team_fk
    foreign key (league_id, destination_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint player_loans_different_teams
    check (source_team_id <> destination_team_id),
  constraint player_loans_ended_after_started
    check (ended_at is null or ended_at >= starts_at),
  constraint player_loans_expires_after_started
    check (expires_at is null or expires_at >= starts_at),
  constraint player_loans_source_event_not_blank
    check (btrim(source_event_key) <> ''),
  unique (league_id, id),
  unique (league_id, source_event_key)
);

create unique index if not exists player_loans_active_player_uidx
  on public.player_loans (league_id, season_id, player_identity_id)
  where status = 'active' and ended_at is null;

create table if not exists public.transfer_events (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  event_type text not null
    check (event_type in ('buy', 'sell', 'loan', 'recall', 'release')),
  player_identity_id uuid not null,
  source_team_id uuid,
  destination_team_id uuid,
  amount bigint not null default 0 check (amount >= 0),
  note text,
  expires_at timestamptz,
  actor_discord_user_id text,
  source text not null default 'discord_bot',
  source_event_key text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint transfer_events_season_fk
    foreign key (league_id, season_id)
    references public.seasons(league_id, id) on delete cascade,
  constraint transfer_events_player_fk
    foreign key (league_id, player_identity_id)
    references public.player_identities(league_id, id) on delete restrict,
  constraint transfer_events_source_team_fk
    foreign key (league_id, source_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint transfer_events_destination_team_fk
    foreign key (league_id, destination_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint transfer_events_source_not_blank check (btrim(source) <> ''),
  constraint transfer_events_source_event_not_blank
    check (btrim(source_event_key) <> ''),
  unique (league_id, id),
  unique (league_id, source_event_key)
);

create index if not exists transfer_events_feed_idx
  on public.transfer_events (league_id, season_id, occurred_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'team_finances',
    'roster_memberships',
    'player_loans'
  ]
  loop
    execute format(
      'drop trigger if exists %I_set_updated_at on public.%I',
      table_name,
      table_name
    );
    execute format(
      'create trigger %I_set_updated_at before update on public.%I '
      'for each row execute function public.atheus_set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

alter table public.team_finances enable row level security;
alter table public.roster_memberships enable row level security;
alter table public.player_loans enable row level security;
alter table public.transfer_events enable row level security;

revoke all on public.team_finances from anon, authenticated;
revoke all on public.roster_memberships from anon, authenticated;
revoke all on public.player_loans from anon, authenticated;
revoke all on public.transfer_events from anon, authenticated;

grant select, insert, update, delete on public.team_finances to service_role;
grant select, insert, update, delete on public.roster_memberships to service_role;
grant select, insert, update, delete on public.player_loans to service_role;
grant select, insert, update, delete on public.transfer_events to service_role;
grant select on public.league_discord_guilds to service_role;
grant select on public.seasons to service_role;
grant select on public.teams to service_role;
grant select, insert, update on public.player_identities to service_role;
grant insert on public.audit_logs to service_role;

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

comment on table public.roster_memberships is
  'Season roster history mirrored from completed Discord transfer actions.';
comment on table public.player_loans is
  'Canonical active and historical player loans for each Atheus league.';
comment on table public.transfer_events is
  'Immutable, idempotent transfer ledger sourced from Discord or website actions.';
comment on function public.atheus_mirror_discord_transaction(uuid, jsonb) is
  'Atomically mirrors one completed local Discord transaction after exact expected-league validation.';

-- Cover canonical roster foreign keys and support idempotent SQLite snapshots.

create index if not exists team_finances_team_fk_idx
  on public.team_finances (league_id, team_id);
create index if not exists roster_memberships_player_fk_idx
  on public.roster_memberships (league_id, player_identity_id);
create index if not exists roster_memberships_team_fk_idx
  on public.roster_memberships (league_id, team_id);
create index if not exists player_loans_player_fk_idx
  on public.player_loans (league_id, player_identity_id);
create index if not exists player_loans_source_team_fk_idx
  on public.player_loans (league_id, source_team_id);
create index if not exists player_loans_destination_team_fk_idx
  on public.player_loans (league_id, destination_team_id);
create index if not exists transfer_events_player_fk_idx
  on public.transfer_events (league_id, player_identity_id);
create index if not exists transfer_events_source_team_fk_idx
  on public.transfer_events (league_id, source_team_id);
create index if not exists transfer_events_destination_team_fk_idx
  on public.transfer_events (league_id, destination_team_id);

create or replace function public.atheus_sync_discord_roster_snapshot(
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
  if v_guild_id = '' then
    raise exception 'discord_guild_id is required';
  end if;
  if jsonb_typeof(coalesce(p_payload -> 'teams', '[]'::jsonb)) <> 'array' then
    raise exception 'teams must be a JSON array';
  end if;
  if jsonb_typeof(coalesce(p_payload -> 'loans', '[]'::jsonb)) <> 'array' then
    raise exception 'loans must be a JSON array';
  end if;

  select mapping.league_id
  into v_league_id
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
  ) mapping
  limit 1;

  if v_league_id is null then
    raise exception 'Discord guild is not linked to an Atheus league';
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
      and status = 'active'
    limit 1;

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
        and discord_user_id = v_player_discord_id
      limit 1;

      if v_player_id is null then
        select id
        into v_player_id
        from public.player_identities
        where league_id = v_league_id
          and normalized_name = v_normalized_name
          and discord_user_id is null
        limit 1;
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
      and discord_user_id = v_player_discord_id
    limit 1;

    select id into v_source_team_id
    from public.teams
    where league_id = v_league_id
      and discord_role_id = btrim(coalesce(v_loan ->> 'source_team_role_id', ''))
      and status = 'active'
    limit 1;

    select id into v_destination_team_id
    from public.teams
    where league_id = v_league_id
      and discord_role_id = btrim(coalesce(v_loan ->> 'destination_team_role_id', ''))
      and status = 'active'
    limit 1;

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

revoke all on function public.atheus_sync_discord_roster_snapshot(jsonb)
  from public, anon, authenticated;
grant execute on function public.atheus_sync_discord_roster_snapshot(jsonb)
  to service_role;

comment on function public.atheus_sync_discord_roster_snapshot(jsonb) is
  'Idempotently reconciles one linked Discord guild SQLite roster snapshot into canonical Atheus state.';

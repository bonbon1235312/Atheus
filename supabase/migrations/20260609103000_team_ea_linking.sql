begin;

create or replace function public.create_league_team(
  p_league_id uuid,
  p_discord_user_id text,
  p_name text,
  p_slug text,
  p_abbreviation text,
  p_discord_role_id text,
  p_primary_colour text,
  p_secondary_colour text,
  p_ea_club_id text default null,
  p_ea_club_name text default null,
  p_platform text default null,
  p_verification_snapshot jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
  v_guild_id text;
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

  if btrim(coalesce(p_name, '')) = '' then
    raise exception 'Team name is required.';
  end if;

  if coalesce(p_slug, '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Team slug is invalid.';
  end if;

  if p_abbreviation is not null
    and char_length(btrim(p_abbreviation)) not between 2 and 8 then
    raise exception 'Team abbreviation must contain 2 to 8 characters.';
  end if;

  select discord_guild_id into v_guild_id
  from public.league_discord_guilds
  where league_id = p_league_id
    and is_primary
    and unlinked_at is null;

  insert into public.teams (
    league_id,
    name,
    slug,
    abbreviation,
    discord_role_id,
    discord_guild_id,
    primary_colour,
    secondary_colour
  )
  values (
    p_league_id,
    btrim(p_name),
    p_slug,
    nullif(upper(btrim(coalesce(p_abbreviation, ''))), ''),
    nullif(btrim(coalesce(p_discord_role_id, '')), ''),
    v_guild_id,
    case when p_primary_colour is null or p_primary_colour = '' then null else upper(p_primary_colour) end,
    case when p_secondary_colour is null or p_secondary_colour = '' then null else upper(p_secondary_colour) end
  )
  returning id into v_team_id;

  if nullif(btrim(coalesce(p_ea_club_id, '')), '') is not null then
    if nullif(btrim(coalesce(p_ea_club_name, '')), '') is null
      or nullif(btrim(coalesce(p_platform, '')), '') is null then
      raise exception 'EA club name and platform are required with a club ID.';
    end if;

    insert into public.team_ea_club_links (
      league_id,
      team_id,
      ea_club_id,
      ea_club_name,
      platform,
      generation,
      verified_at,
      linked_by_discord_user_id,
      verification_snapshot
    )
    values (
      p_league_id,
      v_team_id,
      btrim(p_ea_club_id),
      btrim(p_ea_club_name),
      btrim(p_platform),
      case
        when p_platform = 'common-gen5' then 'gen5'
        when p_platform = 'common-gen4' then 'gen4'
        else null
      end,
      now(),
      p_discord_user_id,
      p_verification_snapshot
    );
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
    p_discord_user_id,
    'team.created',
    'team',
    v_team_id,
    jsonb_build_object(
      'name', btrim(p_name),
      'slug', p_slug,
      'ea_club_id', nullif(btrim(coalesce(p_ea_club_id, '')), '')
    )
  );

  return v_team_id;
end;
$$;

create or replace function public.set_team_ea_club_link(
  p_league_id uuid,
  p_team_id uuid,
  p_discord_user_id text,
  p_ea_club_id text,
  p_ea_club_name text,
  p_platform text,
  p_verification_snapshot jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link_id uuid;
  v_previous jsonb;
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

  perform 1
  from public.teams
  where league_id = p_league_id and id = p_team_id
  for update;

  if not found then
    raise exception 'Team not found.';
  end if;

  if btrim(coalesce(p_ea_club_id, '')) = ''
    or btrim(coalesce(p_ea_club_name, '')) = ''
    or btrim(coalesce(p_platform, '')) = '' then
    raise exception 'EA club ID, name and platform are required.';
  end if;

  select to_jsonb(link) into v_previous
  from public.team_ea_club_links link
  where league_id = p_league_id
    and team_id = p_team_id
    and platform = p_platform
    and inactive_at is null
  order by active_from desc
  limit 1;

  update public.team_ea_club_links
  set inactive_at = now()
  where league_id = p_league_id
    and team_id = p_team_id
    and platform = p_platform
    and inactive_at is null;

  insert into public.team_ea_club_links (
    league_id,
    team_id,
    ea_club_id,
    ea_club_name,
    platform,
    generation,
    verified_at,
    linked_by_discord_user_id,
    verification_snapshot
  )
  values (
    p_league_id,
    p_team_id,
    btrim(p_ea_club_id),
    btrim(p_ea_club_name),
    btrim(p_platform),
    case
      when p_platform = 'common-gen5' then 'gen5'
      when p_platform = 'common-gen4' then 'gen4'
      else null
    end,
    now(),
    p_discord_user_id,
    p_verification_snapshot
  )
  returning id into v_link_id;

  insert into public.audit_logs (
    league_id,
    actor_discord_user_id,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data
  )
  values (
    p_league_id,
    p_discord_user_id,
    case when v_previous is null then 'team.ea_linked' else 'team.ea_relinked' end,
    'team_ea_club_link',
    v_link_id,
    v_previous,
    jsonb_build_object(
      'team_id', p_team_id,
      'ea_club_id', btrim(p_ea_club_id),
      'ea_club_name', btrim(p_ea_club_name),
      'platform', btrim(p_platform)
    )
  );

  return v_link_id;
end;
$$;

create or replace function public.unlink_team_ea_club(
  p_league_id uuid,
  p_team_id uuid,
  p_discord_user_id text,
  p_platform text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_changed integer;
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

  update public.team_ea_club_links
  set inactive_at = now()
  where league_id = p_league_id
    and team_id = p_team_id
    and platform = p_platform
    and inactive_at is null;

  get diagnostics v_changed = row_count;

  if v_changed > 0 then
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
      'team.ea_unlinked',
      'team',
      p_team_id,
      jsonb_build_object('platform', p_platform)
    );
  end if;

  return v_changed;
end;
$$;

revoke all on function public.create_league_team(
  uuid, text, text, text, text, text, text, text, text, text, text, jsonb
) from public, anon, authenticated;
revoke all on function public.set_team_ea_club_link(
  uuid, uuid, text, text, text, text, jsonb
) from public, anon, authenticated;
revoke all on function public.unlink_team_ea_club(
  uuid, uuid, text, text
) from public, anon, authenticated;

grant execute on function public.create_league_team(
  uuid, text, text, text, text, text, text, text, text, text, text, jsonb
) to service_role;
grant execute on function public.set_team_ea_club_link(
  uuid, uuid, text, text, text, text, jsonb
) to service_role;
grant execute on function public.unlink_team_ea_club(
  uuid, uuid, text, text
) to service_role;

commit;

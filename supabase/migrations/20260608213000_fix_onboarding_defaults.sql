begin;

create or replace function public.create_league_onboarding(
  p_name text,
  p_slug text,
  p_short_name text,
  p_description text,
  p_timezone text,
  p_platform text,
  p_discord_guild_id text,
  p_discord_user_id text,
  p_primary_colour text default '#156EE8',
  p_secondary_colour text default '#0C1118',
  p_accent_colour text default '#156EE8'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league_id uuid;
begin
  if btrim(coalesce(p_name, '')) = '' then
    raise exception 'League name is required.';
  end if;

  if coalesce(p_slug, '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'League slug is invalid.';
  end if;

  if btrim(coalesce(p_discord_guild_id, '')) = ''
    or btrim(coalesce(p_discord_user_id, '')) = '' then
    raise exception 'Discord identity is required.';
  end if;

  if not exists (
    select 1
    from pg_timezone_names
    where name = p_timezone
  ) then
    raise exception 'Timezone is invalid.';
  end if;

  insert into public.leagues (
    name,
    slug,
    short_name,
    description,
    timezone,
    default_platform,
    created_by_discord_user_id
  )
  values (
    btrim(p_name),
    p_slug,
    nullif(btrim(coalesce(p_short_name, '')), ''),
    nullif(btrim(coalesce(p_description, '')), ''),
    p_timezone,
    p_platform,
    p_discord_user_id
  )
  returning id into v_league_id;

  insert into public.league_discord_guilds (
    league_id,
    discord_guild_id,
    is_primary,
    linked_by_discord_user_id
  )
  values (
    v_league_id,
    p_discord_guild_id,
    true,
    p_discord_user_id
  );

  update public.league_branding
  set primary_colour = upper(p_primary_colour),
      secondary_colour = upper(p_secondary_colour),
      accent_colour = upper(p_accent_colour),
      updated_at = now()
  where league_id = v_league_id;

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
    p_discord_user_id,
    'league.created',
    'league',
    v_league_id,
    jsonb_build_object(
      'name', btrim(p_name),
      'slug', p_slug,
      'discord_guild_id', p_discord_guild_id
    )
  );

  return v_league_id;
end;
$$;

revoke all on function public.create_league_onboarding(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.create_league_onboarding(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to service_role;

commit;

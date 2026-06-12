begin;

create or replace function public.configure_league_foundation(
  p_league_id uuid,
  p_discord_user_id text,
  p_season_name text,
  p_season_slug text,
  p_starts_on date,
  p_ends_on date,
  p_include_cup boolean,
  p_slots jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_season_id uuid;
  v_league_competition_id uuid;
  v_slot record;
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

  if btrim(coalesce(p_season_name, '')) = '' then
    raise exception 'Season name is required.';
  end if;

  if coalesce(p_season_slug, '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Season slug is invalid.';
  end if;

  if p_ends_on is not null and p_starts_on is not null and p_ends_on < p_starts_on then
    raise exception 'Season end date cannot be before its start date.';
  end if;

  if jsonb_typeof(p_slots) <> 'array' or jsonb_array_length(p_slots) = 0 then
    raise exception 'At least one match window is required.';
  end if;

  insert into public.seasons (
    league_id,
    name,
    slug,
    status,
    starts_on,
    ends_on
  )
  values (
    p_league_id,
    btrim(p_season_name),
    p_season_slug,
    'draft',
    p_starts_on,
    p_ends_on
  )
  returning id into v_season_id;

  insert into public.competitions (
    league_id,
    season_id,
    name,
    slug,
    kind
  )
  values (
    p_league_id,
    v_season_id,
    'League',
    'league',
    'league'
  )
  returning id into v_league_competition_id;

  if p_include_cup then
    insert into public.competitions (
      league_id,
      season_id,
      name,
      slug,
      kind
    )
    values (
      p_league_id,
      v_season_id,
      'Cup',
      'cup',
      'cup'
    );
  end if;

  for v_slot in
    select
      (slot->>'weekday')::integer as weekday,
      (slot->>'kickoff_time')::time as kickoff_time
    from jsonb_array_elements(p_slots) slot
  loop
    if v_slot.weekday < 0 or v_slot.weekday > 6 then
      raise exception 'Match-window weekday is invalid.';
    end if;

    insert into public.league_schedule_slots (
      league_id,
      season_id,
      competition_id,
      weekday,
      local_kickoff_time
    )
    values (
      p_league_id,
      v_season_id,
      null,
      v_slot.weekday,
      v_slot.kickoff_time
    );
  end loop;

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
    'season.foundation_configured',
    'season',
    v_season_id,
    jsonb_build_object(
      'name', btrim(p_season_name),
      'include_cup', p_include_cup,
      'match_windows', p_slots
    )
  );

  return v_season_id;
end;
$$;

revoke all on function public.configure_league_foundation(
  uuid,
  text,
  text,
  text,
  date,
  date,
  boolean,
  jsonb
) from public, anon, authenticated;

grant execute on function public.configure_league_foundation(
  uuid,
  text,
  text,
  text,
  date,
  date,
  boolean,
  jsonb
) to service_role;

commit;

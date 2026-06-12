begin;

create or replace function public.upsert_league_staff(
  p_league_id uuid,
  p_actor_discord_user_id text,
  p_target_discord_user_id text,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before jsonb;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_actor_discord_user_id
      and active
      and role = 'owner'
  ) then
    raise exception 'Only the league owner can manage staff.';
  end if;

  if btrim(coalesce(p_target_discord_user_id, '')) = '' then
    raise exception 'A Discord user ID is required.';
  end if;

  if p_target_discord_user_id = p_actor_discord_user_id then
    raise exception 'The owner role cannot be changed here.';
  end if;

  if p_role not in ('admin', 'reviewer', 'fixture_manager') then
    raise exception 'Staff role is invalid.';
  end if;

  select to_jsonb(m) into v_before
  from public.league_memberships m
  where league_id = p_league_id
    and discord_user_id = p_target_discord_user_id;

  if coalesce(v_before->>'role', '') = 'owner' then
    raise exception 'The owner membership cannot be changed here.';
  end if;

  insert into public.league_memberships (
    league_id,
    discord_user_id,
    role,
    active,
    invited_by_discord_user_id
  )
  values (
    p_league_id,
    p_target_discord_user_id,
    p_role,
    true,
    p_actor_discord_user_id
  )
  on conflict (league_id, discord_user_id)
  do update set
    role = excluded.role,
    active = true,
    invited_by_discord_user_id = excluded.invited_by_discord_user_id,
    updated_at = now();

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
    p_actor_discord_user_id,
    case when v_before is null then 'staff.added' else 'staff.role_changed' end,
    'league_membership',
    p_target_discord_user_id,
    v_before,
    jsonb_build_object(
      'discord_user_id', p_target_discord_user_id,
      'role', p_role,
      'active', true
    )
  );
end;
$$;

create or replace function public.remove_league_staff(
  p_league_id uuid,
  p_actor_discord_user_id text,
  p_target_discord_user_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before jsonb;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_actor_discord_user_id
      and active
      and role = 'owner'
  ) then
    raise exception 'Only the league owner can manage staff.';
  end if;

  select to_jsonb(m) into v_before
  from public.league_memberships m
  where league_id = p_league_id
    and discord_user_id = p_target_discord_user_id
  for update;

  if v_before is null then
    raise exception 'Staff membership was not found.';
  end if;

  if v_before->>'role' = 'owner' then
    raise exception 'The owner membership cannot be removed.';
  end if;

  update public.league_memberships
  set active = false, updated_at = now()
  where league_id = p_league_id
    and discord_user_id = p_target_discord_user_id;

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
    p_actor_discord_user_id,
    'staff.removed',
    'league_membership',
    p_target_discord_user_id,
    v_before,
    jsonb_build_object(
      'discord_user_id', p_target_discord_user_id,
      'active', false
    )
  );
end;
$$;

revoke all on function public.upsert_league_staff(
  uuid, text, text, text
) from public, anon, authenticated;

grant execute on function public.upsert_league_staff(
  uuid, text, text, text
) to service_role;

revoke all on function public.remove_league_staff(
  uuid, text, text
) from public, anon, authenticated;

grant execute on function public.remove_league_staff(
  uuid, text, text
) to service_role;

commit;

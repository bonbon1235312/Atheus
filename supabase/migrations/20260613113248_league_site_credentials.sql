begin;

create table if not exists public.league_site_credentials (
  league_id uuid primary key references public.leagues(id) on delete cascade,
  username text not null,
  normalized_username text not null,
  password_hash text not null,
  failed_attempts integer not null default 0
    check (failed_attempts between 0 and 100),
  locked_until timestamptz,
  password_changed_at timestamptz not null default now(),
  last_signed_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint league_site_credentials_username_length
    check (char_length(username) between 3 and 32),
  constraint league_site_credentials_username_format
    check (username ~ '^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$'),
  constraint league_site_credentials_normalized
    check (normalized_username = lower(username)),
  constraint league_site_credentials_password_hash
    check (password_hash ~ '^scrypt\$')
);

alter table public.league_site_credentials enable row level security;

revoke all on public.league_site_credentials from public, anon, authenticated;
grant select, insert, update, delete on public.league_site_credentials to service_role;

create or replace function public.set_league_site_credential(
  p_league_id uuid,
  p_actor_discord_user_id text,
  p_username text,
  p_password_hash text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_username text := btrim(coalesce(p_username, ''));
  v_normalized_username text := lower(v_username);
  v_site_actor_id text := 'site:' || p_league_id::text;
begin
  if not exists (
    select 1
    from public.league_memberships
    where league_id = p_league_id
      and discord_user_id = p_actor_discord_user_id
      and active
      and role = 'owner'
  ) then
    raise exception 'Only the Discord league owner can change site credentials.';
  end if;

  if v_username !~ '^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$' then
    raise exception 'The site username is invalid.';
  end if;

  if coalesce(p_password_hash, '') !~ '^scrypt\$' then
    raise exception 'The password hash is invalid.';
  end if;

  insert into public.league_site_credentials (
    league_id,
    username,
    normalized_username,
    password_hash
  )
  values (
    p_league_id,
    v_username,
    v_normalized_username,
    p_password_hash
  )
  on conflict (league_id) do update
  set username = excluded.username,
      normalized_username = excluded.normalized_username,
      password_hash = excluded.password_hash,
      failed_attempts = 0,
      locked_until = null,
      password_changed_at = now(),
      updated_at = now();

  insert into public.league_memberships (
    league_id,
    discord_user_id,
    role,
    active,
    invited_by_discord_user_id
  )
  values (
    p_league_id,
    v_site_actor_id,
    'admin',
    true,
    p_actor_discord_user_id
  )
  on conflict (league_id, discord_user_id) do update
  set role = 'admin',
      active = true,
      invited_by_discord_user_id = excluded.invited_by_discord_user_id,
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
    p_league_id,
    p_actor_discord_user_id,
    'league.site_credentials_changed',
    'league_site_credential',
    p_league_id,
    jsonb_build_object('username', v_username)
  );

  return v_site_actor_id;
end;
$$;

revoke all on function public.set_league_site_credential(
  uuid, text, text, text
) from public, anon, authenticated;
grant execute on function public.set_league_site_credential(
  uuid, text, text, text
) to service_role;

comment on table public.league_site_credentials is
  'One server-only website administrator credential per league. Passwords are stored as salted scrypt hashes.';

commit;

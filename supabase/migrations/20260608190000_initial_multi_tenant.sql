-- Atheus League Platform: canonical multi-tenant schema.
-- Additive migration. It does not modify the existing league_bot_* compatibility tables.

create extension if not exists pgcrypto;

create or replace function public.atheus_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'suspended', 'archived')),
  timezone text not null default 'Europe/London',
  default_platform text not null default 'common-gen5',
  created_by_discord_user_id text not null,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leagues_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint leagues_name_not_blank check (btrim(name) <> ''),
  constraint leagues_creator_not_blank check (btrim(created_by_discord_user_id) <> ''),
  unique (id, slug)
);

create table if not exists public.league_discord_guilds (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  discord_guild_id text not null,
  is_primary boolean not null default true,
  linked_by_discord_user_id text not null,
  linked_at timestamptz not null default now(),
  unlinked_at timestamptz,
  constraint league_discord_guild_id_not_blank check (btrim(discord_guild_id) <> ''),
  constraint league_discord_linker_not_blank check (btrim(linked_by_discord_user_id) <> ''),
  constraint league_discord_unlinked_after_linked
    check (unlinked_at is null or unlinked_at >= linked_at),
  unique (league_id, id)
);

create unique index if not exists league_discord_guilds_active_guild_uidx
  on public.league_discord_guilds (discord_guild_id)
  where unlinked_at is null;

create unique index if not exists league_discord_guilds_primary_uidx
  on public.league_discord_guilds (league_id)
  where is_primary and unlinked_at is null;

create table if not exists public.league_memberships (
  league_id uuid not null references public.leagues(id) on delete cascade,
  discord_user_id text not null,
  role text not null
    check (role in ('owner', 'admin', 'reviewer', 'fixture_manager')),
  active boolean not null default true,
  invited_by_discord_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (league_id, discord_user_id),
  constraint league_membership_user_not_blank check (btrim(discord_user_id) <> '')
);

create unique index if not exists league_memberships_one_active_owner_uidx
  on public.league_memberships (league_id)
  where active and role = 'owner';

create table if not exists public.league_branding (
  league_id uuid primary key references public.leagues(id) on delete cascade,
  logo_url text,
  primary_colour text not null default '#156EE8',
  secondary_colour text not null default '#0C1118',
  accent_colour text not null default '#156EE8',
  background_colour text not null default '#F2F0EA',
  surface_colour text not null default '#FFFFFF',
  text_colour text not null default '#0C1118',
  muted_text_colour text not null default '#616873',
  updated_at timestamptz not null default now(),
  constraint league_branding_primary_hex check (primary_colour ~ '^#[0-9A-Fa-f]{6}$'),
  constraint league_branding_secondary_hex check (secondary_colour ~ '^#[0-9A-Fa-f]{6}$'),
  constraint league_branding_accent_hex check (accent_colour ~ '^#[0-9A-Fa-f]{6}$'),
  constraint league_branding_background_hex check (background_colour ~ '^#[0-9A-Fa-f]{6}$'),
  constraint league_branding_surface_hex check (surface_colour ~ '^#[0-9A-Fa-f]{6}$'),
  constraint league_branding_text_hex check (text_colour ~ '^#[0-9A-Fa-f]{6}$'),
  constraint league_branding_muted_text_hex check (muted_text_colour ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.league_settings (
  league_id uuid primary key references public.leagues(id) on delete cascade,
  review_mode text not null default 'manual'
    check (review_mode in ('manual', 'definite_only', 'automatic')),
  default_match_type text not null default 'leagueMatch',
  default_platform text not null default 'common-gen5',
  collector_enabled boolean not null default false,
  public_stats_enabled boolean not null default true,
  forfeit_home_score integer not null default 3 check (forfeit_home_score >= 0),
  forfeit_away_score integer not null default 0 check (forfeit_away_score >= 0),
  points_for_win integer not null default 3 check (points_for_win >= 0),
  points_for_draw integer not null default 1 check (points_for_draw >= 0),
  points_for_loss integer not null default 0 check (points_for_loss >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'archived')),
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seasons_name_not_blank check (btrim(name) <> ''),
  constraint seasons_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint seasons_dates_valid check (ends_on is null or starts_on is null or ends_on >= starts_on),
  unique (league_id, slug),
  unique (league_id, id)
);

create unique index if not exists seasons_one_active_per_league_uidx
  on public.seasons (league_id)
  where status = 'active';

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  name text not null,
  slug text not null,
  kind text not null check (kind in ('league', 'cup', 'friendly')),
  format_config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competitions_league_fk
    foreign key (league_id) references public.leagues(id) on delete cascade,
  constraint competitions_season_fk
    foreign key (league_id, season_id)
    references public.seasons(league_id, id) on delete cascade,
  constraint competitions_name_not_blank check (btrim(name) <> ''),
  constraint competitions_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  unique (league_id, season_id, slug),
  unique (league_id, id),
  unique (league_id, season_id, id)
);

create table if not exists public.league_schedule_slots (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season_id uuid,
  competition_id uuid,
  weekday smallint not null check (weekday between 0 and 6),
  local_kickoff_time time not null,
  collector_before_minutes integer not null default 20
    check (collector_before_minutes between 0 and 360),
  collector_after_minutes integer not null default 75
    check (collector_after_minutes between 0 and 360),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_slot_season_fk
    foreign key (league_id, season_id)
    references public.seasons(league_id, id) on delete cascade,
  constraint schedule_slot_competition_fk
    foreign key (league_id, season_id, competition_id)
    references public.competitions(league_id, season_id, id) on delete restrict,
  constraint schedule_slot_competition_requires_season
    check (competition_id is null or season_id is not null),
  unique (league_id, season_id, weekday, local_kickoff_time)
);

create unique index if not exists league_schedule_slots_global_uidx
  on public.league_schedule_slots (league_id, weekday, local_kickoff_time)
  where season_id is null;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  name text not null,
  slug text not null,
  abbreviation text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'replaced', 'withdrawn')),
  discord_role_id text,
  discord_guild_id text,
  logo_url text,
  primary_colour text,
  secondary_colour text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_name_not_blank check (btrim(name) <> ''),
  constraint teams_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint teams_abbreviation_length check (abbreviation is null or char_length(abbreviation) between 2 and 8),
  constraint teams_primary_hex check (primary_colour is null or primary_colour ~ '^#[0-9A-Fa-f]{6}$'),
  constraint teams_secondary_hex check (secondary_colour is null or secondary_colour ~ '^#[0-9A-Fa-f]{6}$'),
  unique (league_id, slug),
  unique (league_id, id)
);

create unique index if not exists teams_active_discord_role_uidx
  on public.teams (league_id, discord_role_id)
  where discord_role_id is not null and status = 'active';

create table if not exists public.team_ea_club_links (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  team_id uuid not null,
  ea_club_id text not null,
  ea_club_name text not null,
  platform text not null,
  generation text,
  active_from timestamptz not null default now(),
  inactive_at timestamptz,
  verified_at timestamptz,
  linked_by_discord_user_id text not null,
  verification_snapshot jsonb,
  created_at timestamptz not null default now(),
  constraint team_ea_link_team_fk
    foreign key (league_id, team_id)
    references public.teams(league_id, id) on delete cascade,
  constraint team_ea_club_id_not_blank check (btrim(ea_club_id) <> ''),
  constraint team_ea_club_name_not_blank check (btrim(ea_club_name) <> ''),
  constraint team_ea_platform_not_blank check (btrim(platform) <> ''),
  constraint team_ea_linker_not_blank check (btrim(linked_by_discord_user_id) <> ''),
  constraint team_ea_inactive_after_active
    check (inactive_at is null or inactive_at >= active_from),
  unique (league_id, id)
);

create unique index if not exists team_ea_club_links_one_active_per_platform_uidx
  on public.team_ea_club_links (league_id, team_id, platform)
  where inactive_at is null;

create unique index if not exists team_ea_club_links_one_team_per_club_uidx
  on public.team_ea_club_links (league_id, ea_club_id, platform)
  where inactive_at is null;

create index if not exists team_ea_club_links_lookup_idx
  on public.team_ea_club_links (league_id, ea_club_id, platform, active_from desc);

create table if not exists public.team_replacements (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  outgoing_team_id uuid not null,
  incoming_team_id uuid not null,
  effective_at timestamptz not null,
  transfer_fixture_ownership boolean not null default true,
  transfer_table_record boolean not null default true,
  reason text,
  approved_by_discord_user_id text not null,
  created_at timestamptz not null default now(),
  constraint team_replacement_season_fk
    foreign key (league_id, season_id)
    references public.seasons(league_id, id) on delete cascade,
  constraint team_replacement_outgoing_fk
    foreign key (league_id, outgoing_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint team_replacement_incoming_fk
    foreign key (league_id, incoming_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint team_replacement_distinct_teams check (outgoing_team_id <> incoming_team_id),
  constraint team_replacement_approver_not_blank check (btrim(approved_by_discord_user_id) <> ''),
  unique (league_id, season_id, outgoing_team_id, effective_at)
);

create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  competition_id uuid not null,
  external_fixture_key text,
  gameday_number integer check (gameday_number is null or gameday_number > 0),
  round_label text,
  kickoff_at timestamptz not null,
  home_team_id uuid not null,
  away_team_id uuid not null,
  status text not null default 'scheduled'
    check (status in (
      'scheduled',
      'collecting',
      'pending_review',
      'completed',
      'postponed',
      'cancelled'
    )),
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  result_source text,
  result_note text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fixtures_season_fk
    foreign key (league_id, season_id)
    references public.seasons(league_id, id) on delete cascade,
  constraint fixtures_competition_fk
    foreign key (league_id, season_id, competition_id)
    references public.competitions(league_id, season_id, id) on delete cascade,
  constraint fixtures_home_team_fk
    foreign key (league_id, home_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint fixtures_away_team_fk
    foreign key (league_id, away_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint fixtures_distinct_teams check (home_team_id <> away_team_id),
  constraint fixtures_scores_together
    check ((home_score is null) = (away_score is null)),
  unique (league_id, id)
);

create unique index if not exists fixtures_external_key_uidx
  on public.fixtures (league_id, external_fixture_key)
  where external_fixture_key is not null;

create index if not exists fixtures_schedule_idx
  on public.fixtures (league_id, kickoff_at, status);

create index if not exists fixtures_home_team_idx
  on public.fixtures (league_id, home_team_id, kickoff_at desc);

create index if not exists fixtures_away_team_idx
  on public.fixtures (league_id, away_team_id, kickoff_at desc);

create table if not exists public.match_imports (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  fixture_id uuid not null,
  source text not null default 'ea_clubs',
  confidence text not null check (confidence in ('definite', 'possible', 'none')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'superseded')),
  ea_match_id text,
  platform text,
  match_type text,
  played_at timestamptz,
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  raw_payload jsonb not null default '{}'::jsonb,
  diagnostics jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  collected_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_discord_user_id text,
  review_note text,
  constraint match_import_fixture_fk
    foreign key (league_id, fixture_id)
    references public.fixtures(league_id, id) on delete cascade,
  constraint match_import_scores_together
    check ((home_score is null) = (away_score is null)),
  constraint match_import_review_fields
    check (
      (status = 'pending' and reviewed_at is null)
      or
      (status <> 'pending' and reviewed_at is not null)
    ),
  unique (league_id, id),
  unique (league_id, fixture_id, id),
  unique (league_id, idempotency_key)
);

create index if not exists match_imports_review_queue_idx
  on public.match_imports (league_id, status, confidence, collected_at desc);

create index if not exists match_imports_fixture_idx
  on public.match_imports (league_id, fixture_id, collected_at desc);

create unique index if not exists match_imports_ea_identity_uidx
  on public.match_imports (
    league_id,
    lower(coalesce(nullif(btrim(platform), ''), 'unknown')),
    lower(coalesce(nullif(btrim(match_type), ''), 'unknown')),
    btrim(ea_match_id)
  )
  where nullif(btrim(ea_match_id), '') is not null;

create table if not exists public.match_import_player_rows (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  match_import_id uuid not null,
  team_id uuid,
  ea_player_id text,
  gamertag text not null,
  normalized_gamertag text not null,
  position_code text,
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  rating numeric(4,2) check (rating is null or rating between 0 and 10),
  shots integer check (shots is null or shots >= 0),
  passes_made integer check (passes_made is null or passes_made >= 0),
  pass_attempts integer check (pass_attempts is null or pass_attempts >= 0),
  pass_accuracy_pct numeric(5,2)
    check (pass_accuracy_pct is null or pass_accuracy_pct between 0 and 100),
  tackles_made integer check (tackles_made is null or tackles_made >= 0),
  saves integer check (saves is null or saves >= 0),
  red_cards integer check (red_cards is null or red_cards >= 0),
  minutes_played integer check (minutes_played is null or minutes_played between 0 and 240),
  clean_sheet boolean,
  raw_row jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint match_import_player_import_fk
    foreign key (league_id, match_import_id)
    references public.match_imports(league_id, id) on delete cascade,
  constraint match_import_player_team_fk
    foreign key (league_id, team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint match_import_player_gamertag_not_blank check (btrim(gamertag) <> ''),
  constraint match_import_player_normalized_not_blank check (btrim(normalized_gamertag) <> ''),
  unique (league_id, id),
  unique (league_id, match_import_id, team_id, normalized_gamertag)
);

create table if not exists public.player_identities (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  canonical_name text not null,
  normalized_name text not null,
  discord_user_id text,
  current_team_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_identity_team_fk
    foreign key (league_id, current_team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint player_identity_name_not_blank check (btrim(canonical_name) <> ''),
  constraint player_identity_normalized_not_blank check (btrim(normalized_name) <> ''),
  unique (league_id, id),
  unique (league_id, normalized_name)
);

create unique index if not exists player_identities_discord_user_uidx
  on public.player_identities (league_id, discord_user_id)
  where discord_user_id is not null;

create table if not exists public.player_aliases (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  player_identity_id uuid not null,
  alias text not null,
  normalized_alias text not null,
  source text not null default 'ea',
  created_at timestamptz not null default now(),
  constraint player_alias_identity_fk
    foreign key (league_id, player_identity_id)
    references public.player_identities(league_id, id) on delete cascade,
  constraint player_alias_not_blank check (btrim(alias) <> ''),
  constraint player_alias_normalized_not_blank check (btrim(normalized_alias) <> ''),
  unique (league_id, normalized_alias)
);

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

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  fixture_id uuid not null,
  approved_import_id uuid,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  result_source text not null,
  is_forfeit boolean not null default false,
  is_void boolean not null default false,
  correction_reason text,
  approved_by_discord_user_id text not null,
  approved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_fixture_fk
    foreign key (league_id, fixture_id)
    references public.fixtures(league_id, id) on delete cascade,
  constraint matches_approved_import_fk
    foreign key (league_id, fixture_id, approved_import_id)
    references public.match_imports(league_id, fixture_id, id) on delete restrict,
  constraint matches_approver_not_blank check (btrim(approved_by_discord_user_id) <> ''),
  unique (fixture_id),
  unique (league_id, id)
);

create table if not exists public.player_match_stats (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  match_id uuid not null,
  team_id uuid not null,
  player_identity_id uuid not null,
  source_import_row_id uuid,
  position_code text,
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  rating numeric(4,2) check (rating is null or rating between 0 and 10),
  shots integer check (shots is null or shots >= 0),
  passes_made integer check (passes_made is null or passes_made >= 0),
  pass_attempts integer check (pass_attempts is null or pass_attempts >= 0),
  pass_accuracy_pct numeric(5,2)
    check (pass_accuracy_pct is null or pass_accuracy_pct between 0 and 100),
  tackles_made integer check (tackles_made is null or tackles_made >= 0),
  saves integer check (saves is null or saves >= 0),
  red_cards integer check (red_cards is null or red_cards >= 0),
  minutes_played integer check (minutes_played is null or minutes_played between 0 and 240),
  clean_sheet boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_match_stats_match_fk
    foreign key (league_id, match_id)
    references public.matches(league_id, id) on delete cascade,
  constraint player_match_stats_team_fk
    foreign key (league_id, team_id)
    references public.teams(league_id, id) on delete restrict,
  constraint player_match_stats_identity_fk
    foreign key (league_id, player_identity_id)
    references public.player_identities(league_id, id) on delete restrict,
  constraint player_match_stats_import_row_fk
    foreign key (league_id, source_import_row_id)
    references public.match_import_player_rows(league_id, id) on delete restrict,
  unique (league_id, match_id, player_identity_id)
);

create index if not exists player_match_stats_leaderboard_idx
  on public.player_match_stats (league_id, player_identity_id, match_id);

create index if not exists player_match_stats_team_idx
  on public.player_match_stats (league_id, team_id, match_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references public.leagues(id) on delete set null,
  actor_discord_user_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  correlation_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_action_not_blank check (btrim(action) <> ''),
  constraint audit_entity_type_not_blank check (btrim(entity_type) <> '')
);

create index if not exists audit_logs_league_created_idx
  on public.audit_logs (league_id, created_at desc);

create table if not exists public.collector_runs (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  status text not null default 'running'
    check (status in ('running', 'completed', 'partial', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  target_fixture_count integer not null default 0 check (target_fixture_count >= 0),
  fetched_club_count integer not null default 0 check (fetched_club_count >= 0),
  definite_count integer not null default 0 check (definite_count >= 0),
  possible_count integer not null default 0 check (possible_count >= 0),
  no_stats_count integer not null default 0 check (no_stats_count >= 0),
  access_denied_count integer not null default 0 check (access_denied_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  next_retry_at timestamptz,
  diagnostics jsonb not null default '{}'::jsonb,
  constraint collector_run_finished_after_started
    check (finished_at is null or finished_at >= started_at)
);

create index if not exists collector_runs_league_started_idx
  on public.collector_runs (league_id, started_at desc);

create table if not exists public.discord_jobs (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  discord_guild_id text not null,
  job_type text not null,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  status text not null default 'pending'
    check (status in ('pending', 'claimed', 'completed', 'failed', 'cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  claimed_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discord_job_guild_not_blank check (btrim(discord_guild_id) <> ''),
  constraint discord_job_type_not_blank check (btrim(job_type) <> ''),
  unique (league_id, idempotency_key)
);

create index if not exists discord_jobs_queue_idx
  on public.discord_jobs (status, created_at)
  where status in ('pending', 'failed');

create or replace function public.atheus_initialize_league()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.league_branding (league_id)
  values (new.id)
  on conflict (league_id) do nothing;

  insert into public.league_settings (league_id, default_platform)
  values (new.id, new.default_platform)
  on conflict (league_id) do nothing;

  insert into public.league_memberships (league_id, discord_user_id, role)
  values (new.id, new.created_by_discord_user_id, 'owner')
  on conflict (league_id, discord_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists leagues_initialize_defaults on public.leagues;
create trigger leagues_initialize_defaults
after insert on public.leagues
for each row execute function public.atheus_initialize_league();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'leagues',
    'league_memberships',
    'league_branding',
    'league_settings',
    'seasons',
    'competitions',
    'league_schedule_slots',
    'teams',
    'fixtures',
    'player_identities',
    'matches',
    'player_match_stats',
    'discord_jobs'
  ]
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.atheus_set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

alter table public.leagues enable row level security;
alter table public.league_discord_guilds enable row level security;
alter table public.league_memberships enable row level security;
alter table public.league_branding enable row level security;
alter table public.league_settings enable row level security;
alter table public.seasons enable row level security;
alter table public.competitions enable row level security;
alter table public.league_schedule_slots enable row level security;
alter table public.teams enable row level security;
alter table public.team_ea_club_links enable row level security;
alter table public.team_replacements enable row level security;
alter table public.fixtures enable row level security;
alter table public.match_imports enable row level security;
alter table public.match_import_player_rows enable row level security;
alter table public.player_identities enable row level security;
alter table public.player_aliases enable row level security;
alter table public.player_external_identities enable row level security;
alter table public.player_external_identities force row level security;
alter table public.matches enable row level security;
alter table public.player_match_stats enable row level security;
alter table public.audit_logs enable row level security;
alter table public.collector_runs enable row level security;
alter table public.discord_jobs enable row level security;

-- NextAuth owns the website session, so browser clients do not receive direct table
-- policies in this migration. Server routes verify Discord league membership and then
-- use the service-role client. RLS remains enabled as a deny-by-default safety layer.

create or replace view public.atheus_public_fixtures
with (security_invoker = true)
as
select
  f.id,
  f.league_id,
  l.slug as league_slug,
  f.season_id,
  s.name as season_name,
  f.competition_id,
  c.name as competition_name,
  c.kind as competition_kind,
  f.gameday_number,
  f.round_label,
  f.kickoff_at,
  f.status,
  f.home_team_id,
  home.name as home_team_name,
  home.slug as home_team_slug,
  home.abbreviation as home_team_abbreviation,
  f.away_team_id,
  away.name as away_team_name,
  away.slug as away_team_slug,
  away.abbreviation as away_team_abbreviation,
  f.home_score,
  f.away_score,
  f.result_source,
  f.result_note
from public.fixtures f
join public.leagues l on l.id = f.league_id
join public.seasons s on s.id = f.season_id and s.league_id = f.league_id
join public.competitions c on c.id = f.competition_id and c.league_id = f.league_id
join public.teams home on home.id = f.home_team_id and home.league_id = f.league_id
join public.teams away on away.id = f.away_team_id and away.league_id = f.league_id
where l.status = 'active';

create or replace view public.atheus_standings
with (security_invoker = true)
as
with team_results as (
  select
    f.league_id,
    f.season_id,
    f.competition_id,
    f.home_team_id as team_id,
    m.home_score as goals_for,
    m.away_score as goals_against,
    case
      when m.home_score > m.away_score then 1
      else 0
    end as won,
    case
      when m.home_score = m.away_score then 1
      else 0
    end as drawn,
    case
      when m.home_score < m.away_score then 1
      else 0
    end as lost
  from public.matches m
  join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
  join public.competitions c
    on c.id = f.competition_id
    and c.league_id = f.league_id
    and c.kind = 'league'
  where not m.is_void

  union all

  select
    f.league_id,
    f.season_id,
    f.competition_id,
    f.away_team_id as team_id,
    m.away_score as goals_for,
    m.home_score as goals_against,
    case
      when m.away_score > m.home_score then 1
      else 0
    end as won,
    case
      when m.away_score = m.home_score then 1
      else 0
    end as drawn,
    case
      when m.away_score < m.home_score then 1
      else 0
    end as lost
  from public.matches m
  join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
  join public.competitions c
    on c.id = f.competition_id
    and c.league_id = f.league_id
    and c.kind = 'league'
  where not m.is_void
),
aggregated as (
  select
    tr.league_id,
    tr.season_id,
    tr.competition_id,
    tr.team_id,
    count(*)::integer as played,
    sum(tr.won)::integer as won,
    sum(tr.drawn)::integer as drawn,
    sum(tr.lost)::integer as lost,
    sum(tr.goals_for)::integer as goals_for,
    sum(tr.goals_against)::integer as goals_against
  from team_results tr
  group by tr.league_id, tr.season_id, tr.competition_id, tr.team_id
)
select
  a.league_id,
  l.slug as league_slug,
  a.season_id,
  s.name as season_name,
  a.competition_id,
  c.name as competition_name,
  a.team_id,
  t.name as team_name,
  t.slug as team_slug,
  t.abbreviation,
  a.played,
  a.won,
  a.drawn,
  a.lost,
  a.goals_for,
  a.goals_against,
  (a.goals_for - a.goals_against)::integer as goal_difference,
  (
    a.won * settings.points_for_win
    + a.drawn * settings.points_for_draw
    + a.lost * settings.points_for_loss
  )::integer as points
from aggregated a
join public.leagues l on l.id = a.league_id
join public.league_settings settings on settings.league_id = a.league_id
join public.seasons s on s.id = a.season_id and s.league_id = a.league_id
join public.competitions c on c.id = a.competition_id and c.league_id = a.league_id
join public.teams t on t.id = a.team_id and t.league_id = a.league_id;

create or replace view public.atheus_player_totals
with (security_invoker = true)
as
select
  pms.league_id,
  l.slug as league_slug,
  f.season_id,
  f.competition_id,
  pms.player_identity_id,
  pi.canonical_name as player_name,
  pi.current_team_id,
  current_team.name as current_team_name,
  count(distinct pms.match_id)::integer as matches_played,
  sum(pms.goals)::integer as goals,
  sum(pms.assists)::integer as assists,
  sum(pms.goals + pms.assists)::integer as goal_contributions,
  round(avg(pms.rating), 2) as average_rating,
  sum(coalesce(pms.shots, 0))::integer as shots,
  sum(coalesce(pms.passes_made, 0))::integer as passes_made,
  sum(coalesce(pms.pass_attempts, 0))::integer as pass_attempts,
  case
    when sum(coalesce(pms.pass_attempts, 0)) > 0
      then round(
        sum(coalesce(pms.passes_made, 0))::numeric
        / sum(coalesce(pms.pass_attempts, 0))::numeric
        * 100,
        2
      )
    else null
  end as pass_accuracy_pct,
  sum(coalesce(pms.tackles_made, 0))::integer as tackles_made,
  sum(coalesce(pms.saves, 0))::integer as saves,
  sum(coalesce(pms.red_cards, 0))::integer as red_cards,
  count(*) filter (where pms.clean_sheet is true)::integer as clean_sheets,
  array_remove(array_agg(distinct pms.position_code), null) as positions_played,
  max(f.kickoff_at) as last_played_at
from public.player_match_stats pms
join public.matches m
  on m.id = pms.match_id
  and m.league_id = pms.league_id
  and not m.is_void
join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
join public.leagues l on l.id = pms.league_id
join public.player_identities pi
  on pi.id = pms.player_identity_id
  and pi.league_id = pms.league_id
left join public.teams current_team
  on current_team.id = pi.current_team_id
  and current_team.league_id = pi.league_id
group by
  pms.league_id,
  l.slug,
  f.season_id,
  f.competition_id,
  pms.player_identity_id,
  pi.canonical_name,
  pi.current_team_id,
  current_team.name;

revoke all on public.leagues from anon, authenticated;
revoke all on public.league_discord_guilds from anon, authenticated;
revoke all on public.league_memberships from anon, authenticated;
revoke all on public.league_branding from anon, authenticated;
revoke all on public.league_settings from anon, authenticated;
revoke all on public.seasons from anon, authenticated;
revoke all on public.competitions from anon, authenticated;
revoke all on public.league_schedule_slots from anon, authenticated;
revoke all on public.teams from anon, authenticated;
revoke all on public.team_ea_club_links from anon, authenticated;
revoke all on public.team_replacements from anon, authenticated;
revoke all on public.fixtures from anon, authenticated;
revoke all on public.match_imports from anon, authenticated;
revoke all on public.match_import_player_rows from anon, authenticated;
revoke all on public.player_identities from anon, authenticated;
revoke all on public.player_aliases from anon, authenticated;
revoke all on public.player_external_identities from public, anon, authenticated;
grant select, insert on public.player_external_identities to service_role;
revoke all on function public.atheus_reject_external_player_identity_update()
  from public, anon, authenticated, service_role;
revoke all on public.matches from anon, authenticated;
revoke all on public.player_match_stats from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
revoke all on public.collector_runs from anon, authenticated;
revoke all on public.discord_jobs from anon, authenticated;
revoke all on public.atheus_public_fixtures from anon, authenticated;
revoke all on public.atheus_standings from anon, authenticated;
revoke all on public.atheus_player_totals from anon, authenticated;

comment on table public.leagues is
  'Canonical tenant record for one Atheus-operated league.';
comment on table public.team_ea_club_links is
  'Historical EA club identity links. Do not overwrite old links during a relink.';
comment on table public.match_imports is
  'Unapproved fixture-aware match packages discovered by the EA collector.';
comment on table public.matches is
  'Canonical approved result, one per fixture.';
comment on view public.atheus_standings is
  'Approved non-void league results aggregated into standings.';
comment on view public.atheus_player_totals is
  'Approved player match rows aggregated by season and competition.';

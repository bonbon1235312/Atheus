export type LeagueStatus = "draft" | "active" | "suspended" | "archived";
export type LeagueRole = "owner" | "admin" | "reviewer" | "fixture_manager";
export type SeasonStatus = "draft" | "active" | "completed" | "archived";
export type CompetitionKind = "league" | "cup" | "friendly";
export type TeamStatus = "active" | "inactive" | "replaced" | "withdrawn";
export type FixtureStatus =
  | "scheduled"
  | "collecting"
  | "pending_review"
  | "completed"
  | "postponed"
  | "cancelled";
export type ImportConfidence = "definite" | "possible" | "none";
export type ImportStatus = "pending" | "approved" | "rejected" | "superseded";
export type CollectorRunStatus = "running" | "completed" | "partial" | "failed";
export type EntitlementPlan = "free" | "premium" | "grandfathered";
export type PremiumStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled";

export type League = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  description: string | null;
  status: LeagueStatus;
  timezone: string;
  default_platform: string;
  created_by_discord_user_id: string;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeagueMembership = {
  league_id: string;
  discord_user_id: string;
  role: LeagueRole;
  active: boolean;
  invited_by_discord_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LeagueBranding = {
  league_id: string;
  logo_url: string | null;
  primary_colour: string;
  secondary_colour: string;
  accent_colour: string;
  background_colour: string;
  surface_colour: string;
  text_colour: string;
  muted_text_colour: string;
  updated_at: string;
};

export type Season = {
  id: string;
  league_id: string;
  name: string;
  slug: string;
  status: SeasonStatus;
  starts_on: string | null;
  ends_on: string | null;
  created_at: string;
  updated_at: string;
};

export type Competition = {
  id: string;
  league_id: string;
  season_id: string;
  name: string;
  slug: string;
  kind: CompetitionKind;
  format_config: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  league_id: string;
  name: string;
  slug: string;
  abbreviation: string | null;
  status: TeamStatus;
  discord_role_id: string | null;
  discord_guild_id: string | null;
  logo_url: string | null;
  primary_colour: string | null;
  secondary_colour: string | null;
  created_at: string;
  updated_at: string;
};

export type CompetitionTeam = {
  id: string;
  league_id: string;
  competition_id: string;
  team_id: string;
  created_at: string;
};

export type TeamEaClubLink = {
  id: string;
  league_id: string;
  team_id: string;
  ea_club_id: string;
  ea_club_name: string;
  platform: string;
  generation: string | null;
  active_from: string;
  inactive_at: string | null;
  verified_at: string | null;
  linked_by_discord_user_id: string;
  verification_snapshot: Record<string, unknown> | null;
  created_at: string;
};

export type TeamReplacement = {
  id: string;
  league_id: string;
  season_id: string;
  outgoing_team_id: string;
  incoming_team_id: string;
  effective_at: string;
  transfer_fixture_ownership: boolean;
  transfer_table_record: boolean;
  reason: string | null;
  approved_by_discord_user_id: string;
  created_at: string;
};

export type PlayerIdentity = {
  id: string;
  league_id: string;
  canonical_name: string;
  normalized_name: string;
  discord_user_id: string | null;
  current_team_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerAlias = {
  id: string;
  league_id: string;
  player_identity_id: string;
  alias: string;
  normalized_alias: string;
  source: string;
  created_at: string;
};

export type Fixture = {
  id: string;
  league_id: string;
  season_id: string;
  competition_id: string;
  external_fixture_key: string | null;
  gameday_number: number | null;
  round_label: string | null;
  kickoff_at: string;
  home_team_id: string;
  away_team_id: string;
  status: FixtureStatus;
  home_score: number | null;
  away_score: number | null;
  result_source: string | null;
  result_note: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchImport = {
  id: string;
  league_id: string;
  fixture_id: string;
  source: string;
  confidence: ImportConfidence;
  status: ImportStatus;
  ea_match_id: string | null;
  platform: string | null;
  match_type: string | null;
  played_at: string | null;
  home_score: number | null;
  away_score: number | null;
  raw_payload: Record<string, unknown>;
  diagnostics: Record<string, unknown>;
  idempotency_key: string;
  collected_at: string;
  reviewed_at: string | null;
  reviewed_by_discord_user_id: string | null;
  review_note: string | null;
};

export type CollectorRun = {
  id: string;
  league_id: string;
  worker_id: string | null;
  status: CollectorRunStatus;
  started_at: string;
  finished_at: string | null;
  heartbeat_at: string | null;
  target_fixture_count: number;
  fetched_club_count: number;
  definite_count: number;
  possible_count: number;
  no_stats_count: number;
  access_denied_count: number;
  error_count: number;
  next_retry_at: string | null;
  last_error: string | null;
  diagnostics: Record<string, unknown>;
};

export type Standing = {
  league_id: string;
  league_slug: string;
  season_id: string;
  season_name: string;
  competition_id: string;
  competition_name: string;
  team_id: string;
  team_name: string;
  team_slug: string;
  abbreviation: string | null;
  logo_url: string | null;
  primary_colour: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
};

export type PlayerTotal = {
  league_id: string;
  league_slug: string;
  season_id: string;
  season_name: string;
  competition_id: string;
  competition_name: string;
  competition_kind: CompetitionKind;
  player_identity_id: string;
  player_name: string;
  current_team_id: string | null;
  current_team_name: string | null;
  current_team_slug: string | null;
  current_team_abbreviation: string | null;
  current_team_logo_url: string | null;
  matches_played: number;
  goals: number;
  assists: number;
  goal_contributions: number;
  average_rating: number | null;
  shots: number;
  passes_made: number;
  pass_attempts: number;
  pass_accuracy_pct: number | null;
  tackles_made: number;
  saves: number;
  red_cards: number;
  clean_sheets: number;
  positions_played: string[];
  last_played_at: string;
};

export type PublicFixture = {
  id: string;
  league_id: string;
  league_slug: string;
  season_id: string;
  season_name: string;
  season_slug: string;
  competition_id: string;
  competition_name: string;
  competition_slug: string;
  competition_kind: CompetitionKind;
  gameday_number: number | null;
  round_label: string | null;
  kickoff_at: string;
  status: FixtureStatus;
  home_team_id: string;
  home_team_name: string;
  home_team_slug: string;
  home_team_abbreviation: string | null;
  home_team_logo_url: string | null;
  home_team_primary_colour: string | null;
  away_team_id: string;
  away_team_name: string;
  away_team_slug: string;
  away_team_abbreviation: string | null;
  away_team_logo_url: string | null;
  away_team_primary_colour: string | null;
  home_score: number | null;
  away_score: number | null;
  result_source: string | null;
  result_note: string | null;
  has_approved_result: boolean;
  is_forfeit: boolean;
  is_void: boolean;
  approved_at: string | null;
};

export type PlayerMatchHistory = {
  id: string;
  league_id: string;
  league_slug: string;
  season_id: string;
  season_name: string;
  competition_id: string;
  competition_name: string;
  competition_kind: CompetitionKind;
  player_identity_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  team_slug: string;
  team_abbreviation: string | null;
  opponent_team_id: string;
  opponent_team_name: string;
  opponent_team_slug: string;
  kickoff_at: string;
  team_score: number;
  opponent_score: number;
  position_code: string | null;
  goals: number;
  assists: number;
  rating: number | null;
  shots: number | null;
  passes_made: number | null;
  pass_attempts: number | null;
  pass_accuracy_pct: number | null;
  tackles_made: number | null;
  saves: number | null;
  red_cards: number | null;
  minutes_played: number | null;
  clean_sheet: boolean | null;
};

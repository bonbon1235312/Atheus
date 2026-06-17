import "server-only";

import { notFound } from "next/navigation";

import type {
  Competition,
  CompetitionTeam,
  League,
  LeagueBranding,
  PlayerMatchHistory,
  PlayerTotal,
  PublicFixture,
  Season,
  Standing,
  Team,
} from "@/lib/database.types";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type PublicLeague = League & {
  branding: LeagueBranding;
  publicStatsEnabled: boolean;
};

export type LeaderboardSort =
  | "overall"
  | "goals"
  | "assists"
  | "contributions"
  | "rating"
  | "shots"
  | "passes"
  | "tackles"
  | "saves"
  | "clean-sheets";

const defaultBranding: Omit<LeagueBranding, "league_id" | "updated_at"> = {
  logo_url: null,
  primary_colour: "#156EE8",
  secondary_colour: "#0C1118",
  accent_colour: "#156EE8",
  background_colour: "#F2F0EA",
  surface_colour: "#FFFFFF",
  text_colour: "#0C1118",
  muted_text_colour: "#616873",
};

function unwrap<T>(data: unknown): T[] {
  return (data ?? []) as T[];
}

/**
 * Look up a league by slug regardless of status (draft/active/suspended/...).
 * Returns null when no league owns the slug. Used by the public layout and the
 * tenant not-found boundary so a not-yet-activated league can render a friendly
 * "coming soon" page instead of a hard 404.
 */
export async function getPublicLeagueAnyStatus(
  slug: string,
): Promise<PublicLeague | null> {
  const database = supabaseAdmin();
  const { data: league, error } = await database
    .from("leagues")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!league) {
    return null;
  }

  const [{ data: branding, error: brandingError }, { data: settings, error: settingsError }] =
    await Promise.all([
      database
        .from("league_branding")
        .select("*")
        .eq("league_id", league.id)
        .maybeSingle(),
      database
        .from("league_settings")
        .select("public_stats_enabled")
        .eq("league_id", league.id)
        .maybeSingle(),
    ]);

  if (brandingError) {
    throw brandingError;
  }

  if (settingsError) {
    throw settingsError;
  }

  return {
    ...(league as League),
    branding: {
      league_id: league.id as string,
      updated_at: new Date().toISOString(),
      ...defaultBranding,
      ...(branding as LeagueBranding | null),
    },
    publicStatsEnabled: Boolean(settings?.public_stats_enabled ?? true),
  };
}

export async function getPublicLeague(slug: string): Promise<PublicLeague> {
  const league = await getPublicLeagueAnyStatus(slug);

  if (!league || league.status !== "active") {
    notFound();
  }

  return league;
}

export async function getLeagueSeasons(leagueId: string): Promise<Season[]> {
  const { data, error } = await supabaseAdmin()
    .from("seasons")
    .select("*")
    .eq("league_id", leagueId)
    .in("status", ["active", "completed"])
    .order("starts_on", { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return unwrap<Season>(data);
}

export async function getLeagueCompetitions(
  leagueId: string,
  seasonId?: string,
): Promise<Competition[]> {
  let query = supabaseAdmin()
    .from("competitions")
    .select("*")
    .eq("league_id", leagueId)
    .eq("active", true)
    .order("kind")
    .order("name");

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return unwrap<Competition>(data);
}

export async function getCompetitionTeams(
  competitionId: string,
): Promise<CompetitionTeam[]> {
  const { data, error } = await supabaseAdmin()
    .from("competition_teams")
    .select("*")
    .eq("competition_id", competitionId);

  if (error) {
    throw error;
  }

  return unwrap<CompetitionTeam>(data);
}

export async function getLeagueTeams(leagueId: string): Promise<Team[]> {
  const { data, error } = await supabaseAdmin()
    .from("teams")
    .select("*")
    .eq("league_id", leagueId)
    .in("status", ["active", "replaced"])
    .order("name");

  if (error) {
    throw error;
  }

  return unwrap<Team>(data);
}

export async function getPublicFixtures(
  leagueSlug: string,
  filters: {
    seasonId?: string;
    competitionId?: string;
    teamId?: string;
    limit?: number;
    ascending?: boolean;
  } = {},
): Promise<PublicFixture[]> {
  let query = supabaseAdmin()
    .from("atheus_public_fixtures")
    .select("*")
    .eq("league_slug", leagueSlug)
    .order("kickoff_at", { ascending: filters.ascending ?? true });

  if (filters.seasonId) {
    query = query.eq("season_id", filters.seasonId);
  }

  if (filters.competitionId) {
    query = query.eq("competition_id", filters.competitionId);
  }

  if (filters.teamId) {
    query = query.or(
      `home_team_id.eq.${filters.teamId},away_team_id.eq.${filters.teamId}`,
    );
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return unwrap<PublicFixture>(data);
}

export async function getStandings(
  leagueSlug: string,
  seasonId?: string,
  competitionId?: string,
): Promise<Standing[]> {
  let query = supabaseAdmin()
    .from("atheus_standings")
    .select("*")
    .eq("league_slug", leagueSlug);

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  if (competitionId) {
    query = query.eq("competition_id", competitionId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return unwrap<Standing>(data).sort(
    (a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for ||
      a.team_name.localeCompare(b.team_name),
  );
}

export async function getPlayerTotals(
  leagueSlug: string,
  filters: {
    seasonId?: string;
    competitionId?: string;
    teamId?: string;
  } = {},
): Promise<PlayerTotal[]> {
  let query = supabaseAdmin()
    .from("atheus_player_totals")
    .select("*")
    .eq("league_slug", leagueSlug);

  if (filters.seasonId) {
    query = query.eq("season_id", filters.seasonId);
  }

  if (filters.competitionId) {
    query = query.eq("competition_id", filters.competitionId);
  }

  if (filters.teamId) {
    // Attribute by the team the stats were earned with, not where the player
    // currently sits, so a moved/replaced player's history stays with the
    // correct club.
    query = query.eq("team_id", filters.teamId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return unwrap<PlayerTotal>(data);
}

export async function getPlayerHistory(
  leagueSlug: string,
  playerIdentityId: string,
): Promise<PlayerMatchHistory[]> {
  const { data, error } = await supabaseAdmin()
    .from("atheus_player_match_history")
    .select("*")
    .eq("league_slug", leagueSlug)
    .eq("player_identity_id", playerIdentityId)
    .order("kickoff_at", { ascending: false });

  if (error) {
    throw error;
  }

  return unwrap<PlayerMatchHistory>(data);
}

export function positionGroup(positions: string[]): "GK" | "DEF" | "MID" | "ATT" {
  const codes = positions.map((position) => position.toUpperCase());

  if (codes.some((position) => ["GK", "GOALKEEPER"].includes(position))) {
    return "GK";
  }

  if (
    codes.some((position) =>
      [
        "LB",
        "LWB",
        "LCB",
        "CB",
        "RCB",
        "RB",
        "RWB",
        "SW",
        "DEF",
        "DEFENDER",
      ].includes(position),
    )
  ) {
    return "DEF";
  }

  if (
    codes.some((position) =>
      [
        "LDM",
        "CDM",
        "RDM",
        "LCM",
        "CM",
        "RCM",
        "CAM",
        "LAM",
        "RAM",
        "LM",
        "RM",
        "MID",
        "MIDFIELDER",
      ].includes(position),
    )
  ) {
    return "MID";
  }

  return "ATT";
}

export function playerOverall(player: PlayerTotal): number {
  const matches = Math.max(player.matches_played, 1);
  const group = positionGroup(player.positions_played);
  const goalWeight = { GK: 10, DEF: 8, MID: 6, ATT: 5 }[group];
  const assistWeight = { GK: 7, DEF: 5, MID: 4, ATT: 3 }[group];
  const tackleWeight = { GK: 0.35, DEF: 1.2, MID: 1, ATT: 0.65 }[group];
  const saveWeight = group === "GK" ? 1.6 : 0.25;
  const cleanSheetWeight = { GK: 4, DEF: 3, MID: 1.2, ATT: 0.4 }[group];
  const ratingBase = (player.average_rating ?? 6) * 2.2;
  const contributionScore =
    player.goals * goalWeight +
    player.assists * assistWeight +
    player.tackles_made * tackleWeight +
    player.saves * saveWeight +
    player.clean_sheets * cleanSheetWeight +
    player.shots * 0.08 +
    player.passes_made * 0.012 -
    player.red_cards * 3;

  return Math.round((ratingBase + contributionScore / matches) * 10) / 10;
}

export function sortPlayers(
  players: PlayerTotal[],
  sort: LeaderboardSort,
): PlayerTotal[] {
  const metric = (player: PlayerTotal) => {
    switch (sort) {
      case "goals":
        return player.goals;
      case "assists":
        return player.assists;
      case "contributions":
        return player.goal_contributions;
      case "rating":
        return player.average_rating ?? 0;
      case "shots":
        return player.shots;
      case "passes":
        return player.passes_made;
      case "tackles":
        return player.tackles_made;
      case "saves":
        return player.saves;
      case "clean-sheets":
        return player.clean_sheets;
      default:
        return playerOverall(player);
    }
  };

  return [...players].sort(
    (a, b) =>
      metric(b) - metric(a) ||
      b.matches_played - a.matches_played ||
      a.player_name.localeCompare(b.player_name),
  );
}

export function combinePlayerTotals(players: PlayerTotal[]): PlayerTotal[] {
  const combined = new Map<string, PlayerTotal>();

  for (const player of players) {
    const current = combined.get(player.player_identity_id);

    if (!current) {
      combined.set(player.player_identity_id, { ...player });
      continue;
    }

    const matchesPlayed = current.matches_played + player.matches_played;
    const ratingTotal =
      (current.average_rating ?? 0) * current.matches_played +
      (player.average_rating ?? 0) * player.matches_played;
    const passAttempts = current.pass_attempts + player.pass_attempts;
    const passesMade = current.passes_made + player.passes_made;

    combined.set(player.player_identity_id, {
      ...current,
      competition_id: "all",
      competition_name: "All competitions",
      // A combined row spans every team the player turned out for, so the
      // earned-team columns are no longer meaningful — represent them as the
      // player's current club (falling back to the first earned team).
      team_id: current.current_team_id ?? current.team_id,
      team_name: current.current_team_name ?? current.team_name,
      team_slug: current.current_team_slug ?? current.team_slug,
      team_abbreviation:
        current.current_team_abbreviation ?? current.team_abbreviation,
      team_logo_url: current.current_team_logo_url ?? current.team_logo_url,
      matches_played: matchesPlayed,
      goals: current.goals + player.goals,
      assists: current.assists + player.assists,
      goal_contributions:
        current.goal_contributions + player.goal_contributions,
      average_rating:
        matchesPlayed > 0
          ? Math.round((ratingTotal / matchesPlayed) * 100) / 100
          : null,
      shots: current.shots + player.shots,
      passes_made: passesMade,
      pass_attempts: passAttempts,
      pass_accuracy_pct:
        passAttempts > 0
          ? Math.round((passesMade / passAttempts) * 10000) / 100
          : null,
      tackles_made: current.tackles_made + player.tackles_made,
      saves: current.saves + player.saves,
      red_cards: current.red_cards + player.red_cards,
      clean_sheets: current.clean_sheets + player.clean_sheets,
      positions_played: [
        ...new Set([...current.positions_played, ...player.positions_played]),
      ],
      last_played_at:
        new Date(current.last_played_at) > new Date(player.last_played_at)
          ? current.last_played_at
          : player.last_played_at,
    });
  }

  return [...combined.values()];
}

/**
 * Merge the earned-team split rows back down to one row per competition for a
 * single player. The view now emits a row per (player, competition, team), so a
 * player who moved clubs mid-competition has several rows sharing a
 * competition_id; this collapses them while preserving the competition's
 * identity (combinePlayerTotals would relabel it to "all").
 */
export function combinePlayerTotalsByCompetition(
  players: PlayerTotal[],
): PlayerTotal[] {
  const byCompetition = new Map<string, PlayerTotal[]>();

  for (const player of players) {
    const group = byCompetition.get(player.competition_id) ?? [];
    group.push(player);
    byCompetition.set(player.competition_id, group);
  }

  return [...byCompetition.values()].map((group) => ({
    ...combinePlayerTotals(group)[0],
    competition_id: group[0].competition_id,
    competition_name: group[0].competition_name,
  }));
}

export function formatKickoff(date: string, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export function dateKey(date: string | Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function currentDateKey(timezone: string) {
  return dateKey(new Date(), timezone);
}

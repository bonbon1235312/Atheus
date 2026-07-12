import Link from "next/link";

import type { LeaderboardSort } from "@/lib/public-league-data";
import {
  combinePlayerTotals,
  getLeagueCompetitions,
  getLeagueSeasons,
  getLeagueTeams,
  getPlayerTotals,
  getPublicLeague,
  playerOverall,
  sortPlayers,
} from "@/lib/public-league-data";
import { getTenantUrlBuilder } from "@/lib/tenant-url";

export const revalidate = 60;

const sortOptions: Array<{ value: LeaderboardSort; label: string }> = [
  { value: "overall", label: "Overall index" },
  { value: "goals", label: "Goals" },
  { value: "assists", label: "Assists" },
  { value: "contributions", label: "Goals + assists" },
  { value: "rating", label: "Average rating" },
  { value: "shots", label: "Shots" },
  { value: "passes", label: "Passes" },
  { value: "tackles", label: "Tackles" },
  { value: "saves", label: "Saves" },
  { value: "clean-sheets", label: "Clean sheets" },
];

type StatsPageProps = {
  params: Promise<{ leagueSlug: string }>;
  searchParams: Promise<{
    competition?: string;
    position?: string;
    q?: string;
    season?: string;
    sort?: string;
    team?: string;
  }>;
};

function metricValue(
  sort: LeaderboardSort,
  player: Awaited<ReturnType<typeof getPlayerTotals>>[number],
) {
  switch (sort) {
    case "goals":
      return player.goals;
    case "assists":
      return player.assists;
    case "contributions":
      return player.goal_contributions;
    case "rating":
      return player.average_rating?.toFixed(2) || "N/A";
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
      return playerOverall(player).toFixed(1);
  }
}

export default async function StatsPage({
  params,
  searchParams,
}: StatsPageProps) {
  const [{ leagueSlug }, query] = await Promise.all([params, searchParams]);
  const [league, tenantUrl] = await Promise.all([
    getPublicLeague(leagueSlug),
    getTenantUrlBuilder(leagueSlug),
  ]);
  const seasons = await getLeagueSeasons(league.id);
  const selectedSeason =
    seasons.find((season) => season.id === query.season) ||
    seasons.find((season) => season.status === "active") ||
    seasons[0];
  const [competitions, teams] = await Promise.all([
    selectedSeason
      ? getLeagueCompetitions(league.id, selectedSeason.id)
      : Promise.resolve([]),
    getLeagueTeams(league.id),
  ]);
  const selectedCompetition = competitions.find(
    (competition) => competition.id === query.competition,
  );
  const rawPlayers = league.publicStatsEnabled
    ? await getPlayerTotals(leagueSlug, {
        seasonId: selectedSeason?.id,
        competitionId: selectedCompetition?.id,
        teamId: teams.some((team) => team.id === query.team) ? query.team : undefined,
      })
    : [];
  // Always merge by identity so a player who turned out for more than one club
  // (a transfer or a team swap) shows as a single leaderboard row, not one per
  // club. With a competition selected, rawPlayers is already single-competition,
  // so this just collapses the earned-team split.
  const players = combinePlayerTotals(rawPlayers);
  const positions = [...new Set(players.flatMap((player) => player.positions_played))]
    .filter(Boolean)
    .sort();
  const selectedSort = sortOptions.some((option) => option.value === query.sort)
    ? (query.sort as LeaderboardSort)
    : "overall";
  const search = query.q?.trim().toLocaleLowerCase() || "";
  const filteredPlayers = players.filter(
    (player) =>
      (!query.position || player.positions_played.includes(query.position)) &&
      (!search ||
        player.player_name.toLocaleLowerCase().includes(search) ||
        player.current_team_name?.toLocaleLowerCase().includes(search)),
  );
  const sortedPlayers = sortPlayers(filteredPlayers, selectedSort);

  return (
    <main className="league-public-page public-index-page">
      <section className="public-page-heading">
        <p className="public-kicker">Verified performance</p>
        <h1>Player leaderboard</h1>
        <p>
          Search every player and rank the field by attacking, defensive,
          goalkeeping or all-round output.
        </p>
      </section>

      <form className="public-filter-bar public-stats-filter">
        <label className="public-search-field">
          <span>Player or club</span>
          <input defaultValue={query.q || ""} name="q" placeholder="Search gamertag" />
        </label>
        <label>
          <span>Sort</span>
          <select defaultValue={selectedSort} name="sort">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Position</span>
          <select defaultValue={query.position || ""} name="position">
            <option value="">All positions</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Club</span>
          <select defaultValue={query.team || ""} name="team">
            <option value="">All clubs</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Competition</span>
          <select defaultValue={selectedCompetition?.id || ""} name="competition">
            <option value="">All competitions</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="season" value={selectedSeason?.id || ""} />
        <button type="submit">Apply</button>
      </form>

      {selectedSort === "overall" ? (
        <p className="overall-note">
          The overall index adjusts goals, assists, tackles, saves and clean sheets
          by position, then combines them with rating and per-match output.
        </p>
      ) : null}

      <div className="leaderboard-table">
        <div className="leaderboard-head" aria-hidden="true">
          <span>Rank</span>
          <span>Player</span>
          <span>Positions</span>
          <span>MP</span>
          <span>G</span>
          <span>A</span>
          <span>Rating</span>
          <span>{sortOptions.find((option) => option.value === selectedSort)?.label}</span>
        </div>
        {sortedPlayers.map((player, index) => (
          <Link
            className="leaderboard-row"
            href={tenantUrl(`/players/${player.player_identity_id}`)}
            key={player.player_identity_id}
          >
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span className="leaderboard-player">
              <strong>{player.player_name}</strong>
              <small>{player.current_team_name || "Unassigned"}</small>
            </span>
            <span>{player.positions_played.join(" / ") || "N/A"}</span>
            <b>{player.matches_played}</b>
            <b>{player.goals}</b>
            <b>{player.assists}</b>
            <b>{player.average_rating?.toFixed(2) || "N/A"}</b>
            <em>{metricValue(selectedSort, player)}</em>
          </Link>
        ))}
      </div>

      {!league.publicStatsEnabled ? (
        <div className="public-empty">
          <strong>Public statistics are paused.</strong>
          <span>The league operator can enable them from league settings.</span>
        </div>
      ) : null}
      {league.publicStatsEnabled && !sortedPlayers.length ? (
        <div className="public-empty">
          <strong>No players match these filters.</strong>
          <span>Try another position, club or search term.</span>
        </div>
      ) : null}
    </main>
  );
}

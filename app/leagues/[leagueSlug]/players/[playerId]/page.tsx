import { notFound } from "next/navigation";
import Link from "next/link";

import {
  combinePlayerTotals,
  combinePlayerTotalsByCompetition,
  formatKickoff,
  getLeagueSeasons,
  getPlayerHistory,
  getPlayerTotals,
  getPublicLeague,
  playerOverall,
} from "@/lib/public-league-data";
import { getTenantUrlBuilder } from "@/lib/tenant-url";

export const revalidate = 60;

type PlayerPageProps = {
  params: Promise<{ leagueSlug: string; playerId: string }>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { leagueSlug, playerId } = await params;
  const [league, tenantUrl] = await Promise.all([
    getPublicLeague(leagueSlug),
    getTenantUrlBuilder(leagueSlug),
  ]);

  if (!league.publicStatsEnabled) {
    notFound();
  }

  const seasons = await getLeagueSeasons(league.id);
  const season = seasons.find((item) => item.status === "active") || seasons[0];
  const [rawTotals, history] = await Promise.all([
    getPlayerTotals(leagueSlug, { seasonId: season?.id }),
    getPlayerHistory(leagueSlug, playerId),
  ]);
  const competitionTotals = combinePlayerTotalsByCompetition(
    rawTotals.filter((player) => player.player_identity_id === playerId),
  );
  const player = combinePlayerTotals(competitionTotals)[0];

  if (!player) {
    notFound();
  }

  const teamHistory = [
    ...new Map(
      history.map((match) => [
        match.team_id,
        {
          id: match.team_id,
          name: match.team_name,
          slug: match.team_slug,
          abbreviation: match.team_abbreviation,
        },
      ]),
    ).values(),
  ];

  return (
    <main className="league-public-page public-index-page">
      <section className="player-profile-hero">
        <div>
          <p className="public-kicker">
            {player.positions_played.join(" / ") || "Player"} / {season?.name}
          </p>
          <h1>{player.player_name}</h1>
          <p>
            Consolidated performance across every approved appearance, including
            historical club changes.
          </p>
        </div>
        <div className="player-overall">
          <span>Overall index</span>
          <strong>{playerOverall(player).toFixed(1)}</strong>
          <small>{player.matches_played} approved matches</small>
        </div>
      </section>

      <section className="player-metric-grid">
        <div>
          <span>Goals</span>
          <strong>{player.goals}</strong>
        </div>
        <div>
          <span>Assists</span>
          <strong>{player.assists}</strong>
        </div>
        <div>
          <span>Rating</span>
          <strong>{player.average_rating?.toFixed(2) || "-"}</strong>
        </div>
        <div>
          <span>Shots</span>
          <strong>{player.shots}</strong>
        </div>
        <div>
          <span>Passes</span>
          <strong>{player.passes_made}</strong>
        </div>
        <div>
          <span>Pass accuracy</span>
          <strong>
            {player.pass_accuracy_pct !== null
              ? `${player.pass_accuracy_pct.toFixed(1)}%`
              : "-"}
          </strong>
        </div>
        <div>
          <span>Tackles</span>
          <strong>{player.tackles_made}</strong>
        </div>
        <div>
          <span>Saves</span>
          <strong>{player.saves}</strong>
        </div>
        <div>
          <span>Clean sheets</span>
          <strong>{player.clean_sheets}</strong>
        </div>
      </section>

      <section className="public-split-section player-detail-split">
        <div>
          <header className="public-section-heading">
            <div>
              <p className="public-kicker">Club record</p>
              <h2>Teams represented</h2>
            </div>
          </header>
          <div className="player-team-history">
            {teamHistory.map((team) => (
              <Link
                href={tenantUrl(`/teams/${team.slug}`)}
                key={team.id}
              >
                <span>{team.abbreviation || "Club"}</span>
                <strong>{team.name}</strong>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <header className="public-section-heading">
            <div>
              <p className="public-kicker">Competition split</p>
              <h2>Season totals</h2>
            </div>
          </header>
          <div className="competition-total-list">
            {competitionTotals.map((total) => (
              <div key={total.competition_id}>
                <span>
                  <strong>{total.competition_name}</strong>
                  <small>{total.matches_played} matches</small>
                </span>
                <b>{total.goals} G</b>
                <b>{total.assists} A</b>
                <b>{total.average_rating?.toFixed(2) || "-"} RTG</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <header className="public-section-heading">
          <div>
            <p className="public-kicker">Match log</p>
            <h2>Every appearance</h2>
          </div>
        </header>
        <div className="player-match-table">
          <div className="player-match-head" aria-hidden="true">
            <span>Date</span>
            <span>Club</span>
            <span>Opponent</span>
            <span>Score</span>
            <span>Pos</span>
            <span>G</span>
            <span>A</span>
            <span>Rating</span>
          </div>
          {history.map((match) => (
            <div className="player-match-row" key={match.id}>
              <span>{formatKickoff(match.kickoff_at, league.timezone)}</span>
              <Link href={tenantUrl(`/teams/${match.team_slug}`)}>
                {match.team_name}
              </Link>
              <Link href={tenantUrl(`/teams/${match.opponent_team_slug}`)}>
                {match.opponent_team_name}
              </Link>
              <b>
                {match.team_score}-{match.opponent_score}
              </b>
              <span>{match.position_code || "-"}</span>
              <b>{match.goals}</b>
              <b>{match.assists}</b>
              <b>{match.rating?.toFixed(1) || "-"}</b>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

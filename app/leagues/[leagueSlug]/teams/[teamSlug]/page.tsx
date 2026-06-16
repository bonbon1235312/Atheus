import { notFound } from "next/navigation";
import Link from "next/link";

import {
  combinePlayerTotals,
  getLeagueCompetitions,
  getLeagueSeasons,
  getLeagueTeams,
  getPlayerTotals,
  getPublicFixtures,
  getPublicLeague,
  getStandings,
  sortPlayers,
} from "@/lib/public-league-data";

import { FixtureRow } from "../../_components/fixture-row";
import { LeagueMark } from "../../_components/league-mark";

export const revalidate = 60;

type TeamPageProps = {
  params: Promise<{ leagueSlug: string; teamSlug: string }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
  const { leagueSlug, teamSlug } = await params;
  const league = await getPublicLeague(leagueSlug);
  const [teams, seasons] = await Promise.all([
    getLeagueTeams(league.id),
    getLeagueSeasons(league.id),
  ]);
  const team = teams.find((item) => item.slug === teamSlug);

  if (!team) {
    notFound();
  }

  const season = seasons.find((item) => item.status === "active") || seasons[0];
  const competitions = season
    ? await getLeagueCompetitions(league.id, season.id)
    : [];
  const leagueCompetition = competitions.find((item) => item.kind === "league");
  const [fixtures, standings, rawPlayers] = await Promise.all([
    getPublicFixtures(leagueSlug, {
      seasonId: season?.id,
      teamId: team.id,
      limit: 100,
      ascending: false,
    }),
    getStandings(leagueSlug, season?.id, leagueCompetition?.id),
    league.publicStatsEnabled
      ? getPlayerTotals(leagueSlug, {
          seasonId: season?.id,
          teamId: team.id,
        })
      : Promise.resolve([]),
  ]);
  const players = sortPlayers(combinePlayerTotals(rawPlayers), "overall");
  const standing = standings.find((row) => row.team_id === team.id);
  const latestFixtures = fixtures.slice(0, 6);

  return (
    <main className="league-public-page public-index-page">
      <section className="team-profile-hero">
        <LeagueMark
          colour={team.primary_colour}
          logoUrl={team.logo_url}
          name={team.name}
        />
        <div>
          <p className="public-kicker">{team.abbreviation || "League club"}</p>
          <h1>{team.name}</h1>
          <p>{season?.name || "Current season"} squad and match record.</p>
        </div>
        <dl>
          <div>
            <dt>Position</dt>
            <dd>
              {standing
                ? standings.findIndex((row) => row.team_id === team.id) + 1
                : "-"}
            </dd>
          </div>
          <div>
            <dt>Points</dt>
            <dd>{standing?.points ?? 0}</dd>
          </div>
          <div>
            <dt>Goal difference</dt>
            <dd>
              {standing && standing.goal_difference > 0 ? "+" : ""}
              {standing?.goal_difference ?? 0}
            </dd>
          </div>
        </dl>
      </section>

      <section className="public-section">
        <header className="public-section-heading">
          <div>
            <p className="public-kicker">Club schedule</p>
            <h2>Recent & upcoming</h2>
          </div>
          <Link href={`/fixtures?team=${team.id}`}>
            Full club schedule
          </Link>
        </header>
        <div className="public-fixture-list">
          {latestFixtures.map((fixture) => (
            <FixtureRow
              fixture={fixture}
              key={fixture.id}
              timezone={league.timezone}
            />
          ))}
          {!latestFixtures.length ? (
            <div className="public-empty">
              <strong>No published club fixtures.</strong>
              <span>This club’s schedule will appear after publishing.</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="public-section">
        <header className="public-section-heading">
          <div>
            <p className="public-kicker">Current squad</p>
            <h2>Top performers</h2>
          </div>
          <Link href={`/stats?team=${team.id}`}>
            All club stats
          </Link>
        </header>
        <div className="team-player-grid">
          {players.map((player) => (
            <Link
              href={`/players/${player.player_identity_id}`}
              key={player.player_identity_id}
            >
              <span>{player.positions_played.join(" / ") || "N/A"}</span>
              <strong>{player.player_name}</strong>
              <dl>
                <div>
                  <dt>MP</dt>
                  <dd>{player.matches_played}</dd>
                </div>
                <div>
                  <dt>G</dt>
                  <dd>{player.goals}</dd>
                </div>
                <div>
                  <dt>A</dt>
                  <dd>{player.assists}</dd>
                </div>
                <div>
                  <dt>RTG</dt>
                  <dd>{player.average_rating?.toFixed(1) || "-"}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
        {!players.length ? (
          <div className="public-empty">
            <strong>No approved player rows for this club.</strong>
            <span>The squad populates automatically from approved match statistics.</span>
          </div>
        ) : null}
      </section>
    </main>
  );
}

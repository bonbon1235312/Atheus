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
  currentDateKey,
  dateKey,
  playerOverall,
  sortPlayers,
} from "@/lib/public-league-data";

import { FixtureRow } from "./_components/fixture-row";
import { LeagueMark } from "./_components/league-mark";
import { StandingsTable } from "./_components/standings-table";

export const revalidate = 60;

type LeagueHomeProps = {
  params: Promise<{ leagueSlug: string }>;
  searchParams: Promise<{ competition?: string }>;
};

export default async function LeagueHome({ params, searchParams }: LeagueHomeProps) {
  const [{ leagueSlug }, query] = await Promise.all([params, searchParams]);
  const league = await getPublicLeague(leagueSlug);
  const seasons = await getLeagueSeasons(league.id);
  const season = seasons.find((item) => item.status === "active") || seasons[0];
  const allCompetitions = season
    ? await getLeagueCompetitions(league.id, season.id)
    : [];
  const divisions = allCompetitions.filter((item) => item.kind === "league");
  const selectedDivision =
    divisions.find((d) => d.id === query.competition) || divisions[0];

  const [fixtures, standings, players, teams] = await Promise.all([
    getPublicFixtures(leagueSlug, {
      seasonId: season?.id,
      limit: 240,
      ascending: true,
    }),
    getStandings(leagueSlug, season?.id, selectedDivision?.id),
    league.publicStatsEnabled
      ? getPlayerTotals(leagueSlug, { seasonId: season?.id })
      : Promise.resolve([]),
    getLeagueTeams(league.id),
  ]);

  const today = currentDateKey(league.timezone);
  const todaysFixtures = fixtures.filter(
    (fixture) => dateKey(fixture.kickoff_at, league.timezone) === today,
  );
  const upcoming = fixtures
    .filter((fixture) => !fixture.has_approved_result)
    .slice(0, 5);
  const recent = fixtures
    .filter((fixture) => fixture.has_approved_result)
    .sort(
      (a, b) =>
        new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime(),
    )
    .slice(0, 5);
  const topPlayers = sortPlayers(combinePlayerTotals(players), "overall").slice(
    0,
    5,
  );

  return (
    <main className="league-public-page">
      <section className="league-public-hero">
        <div>
          <p className="public-kicker">
            {season?.name || "League operations"} / {league.timezone}
          </p>
          <h1>{league.name}</h1>
          <p>
            {league.description ||
              "The official home for fixtures, results, standings and verified player performance."}
          </p>
        </div>
        <dl>
          <div>
            <dt>Clubs</dt>
            <dd>{teams.length.toString().padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Fixtures</dt>
            <dd>{fixtures.length.toString().padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Approved</dt>
            <dd>
              {fixtures
                .filter((fixture) => fixture.has_approved_result)
                .length.toString()
                .padStart(2, "0")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="public-section public-matchday-section">
        <header className="public-section-heading">
          <div>
            <p className="public-kicker">Match centre</p>
          <h2>
            {todaysFixtures.length
              ? "Today's fixtures"
              : upcoming.length
                ? "Next fixtures"
                : "Latest results"}
          </h2>
          </div>
          <Link href="/fixtures">View all fixtures</Link>
        </header>

        <div className="public-fixture-list">
          {(todaysFixtures.length
            ? todaysFixtures
            : upcoming.length
              ? upcoming
              : recent
          ).map((fixture) => (
            <FixtureRow
              fixture={fixture}
              key={fixture.id}
              timezone={league.timezone}
            />
          ))}
          {!todaysFixtures.length && !upcoming.length && !recent.length ? (
            <div className="public-empty">
              <strong>No published fixtures yet.</strong>
              <span>The first matchday will appear here after it is published.</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="public-split-section">
        <div className="public-table-preview">
          <header className="public-section-heading">
            <div>
              <p className="public-kicker">League table</p>
              <h2>Current order</h2>
            </div>
            <Link href="/table">Full table</Link>
          </header>
          {divisions.length > 1 ? (
            <nav className="division-tabs">
              {divisions.map((division) => (
                <Link
                  key={division.id}
                  className={`division-tab${selectedDivision?.id === division.id ? " division-tab-active" : ""}`}
                  href={`?competition=${division.id}`}
                >
                  {division.name}
                </Link>
              ))}
            </nav>
          ) : null}
          {standings.length ? (
            <StandingsTable
              compact
              rows={standings.slice(0, 6)}
            />
          ) : (
            <div className="public-empty">
              <strong>The table is ready.</strong>
              <span>Approved league results will determine the standings.</span>
            </div>
          )}
        </div>

        <div className="public-performer-preview">
          <header className="public-section-heading">
            <div>
              <p className="public-kicker">Performance index</p>
              <h2>Players</h2>
            </div>
            <Link href="/stats">All stats</Link>
          </header>
          <div className="performer-list">
            {topPlayers.map((player, index) => (
              <Link
                href={`/players/${player.player_identity_id}`}
                key={`${player.competition_id}-${player.player_identity_id}`}
              >
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>
                  <strong>{player.player_name}</strong>
                  <small>{player.current_team_name || "Unassigned"}</small>
                </span>
                <em>{playerOverall(player).toFixed(1)}</em>
              </Link>
            ))}
            {!topPlayers.length ? (
              <div className="public-empty">
                <strong>No approved player data yet.</strong>
                <span>Player rankings appear after the first stats package is approved.</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="public-section public-clubs-section">
        <header className="public-section-heading">
          <div>
            <p className="public-kicker">League clubs</p>
            <h2>The field</h2>
          </div>
        </header>
        <div className="public-club-grid">
          {teams.map((team) => (
            <Link href={`/teams/${team.slug}`} key={team.id}>
              <LeagueMark
                colour={team.primary_colour}
                logoUrl={team.logo_url}
                name={team.name}
              />
              <span>
                <strong>{team.name}</strong>
                <small>{team.abbreviation || "Club"}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

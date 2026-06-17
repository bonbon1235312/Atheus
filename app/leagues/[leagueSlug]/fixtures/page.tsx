import Link from "next/link";

import {
  getLeagueCompetitions,
  getLeagueSeasons,
  getLeagueTeams,
  getPublicFixtures,
  getPublicLeague,
} from "@/lib/public-league-data";

import { FixtureRow } from "../_components/fixture-row";

export const revalidate = 60;

type FixturesPageProps = {
  params: Promise<{ leagueSlug: string }>;
  searchParams: Promise<{
    competition?: string;
    season?: string;
    team?: string;
    view?: string;
  }>;
};

export default async function FixturesPage({
  params,
  searchParams,
}: FixturesPageProps) {
  const [{ leagueSlug }, query] = await Promise.all([params, searchParams]);
  const league = await getPublicLeague(leagueSlug);
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
  const divisions = competitions.filter(
    (competition) => competition.kind === "league",
  );
  const buildTabHref = (competitionId: string) => {
    const next = new URLSearchParams();
    if (selectedSeason) next.set("season", selectedSeason.id);
    if (competitionId) next.set("competition", competitionId);
    if (query.team) next.set("team", query.team);
    if (query.view) next.set("view", query.view);
    const queryString = next.toString();
    return `/${leagueSlug}/fixtures${queryString ? `?${queryString}` : ""}`;
  };
  const fixtures = await getPublicFixtures(leagueSlug, {
    seasonId: selectedSeason?.id,
    competitionId: selectedCompetition?.id,
    teamId: teams.some((team) => team.id === query.team) ? query.team : undefined,
    limit: 500,
    ascending: true,
  });
  const visibleFixtures =
    query.view === "results"
      ? fixtures.filter((fixture) => fixture.has_approved_result)
      : query.view === "upcoming"
        ? fixtures.filter(
            (fixture) => !fixture.has_approved_result,
          )
        : fixtures;
  const grouped = Map.groupBy(visibleFixtures, (fixture) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: league.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(fixture.kickoff_at)),
  );

  return (
    <main className="league-public-page public-index-page">
      <section className="public-page-heading">
        <p className="public-kicker">Match centre</p>
        <h1>Fixtures & results</h1>
        <p>Every published matchday, with scores shown only after approval.</p>
      </section>

      <form className="public-filter-bar">
        <label>
          <span>Season</span>
          <select defaultValue={selectedSeason?.id || ""} name="season">
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
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
          <span>Show</span>
          <select defaultValue={query.view || "all"} name="view">
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="results">Results</option>
          </select>
        </label>
        <button type="submit">Apply filters</button>
      </form>

      {divisions.length > 1 ? (
        <nav className="division-tabs">
          <Link
            className={`division-tab${!selectedCompetition ? " division-tab-active" : ""}`}
            href={buildTabHref("")}
          >
            All divisions
          </Link>
          {divisions.map((division) => (
            <Link
              key={division.id}
              className={`division-tab${selectedCompetition?.id === division.id ? " division-tab-active" : ""}`}
              href={buildTabHref(division.id)}
            >
              {division.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="public-date-groups">
        {[...grouped.entries()].map(([date, dateFixtures]) => (
          <section key={date}>
            <header>
              <span>{date}</span>
              <strong>{dateFixtures.length} matches</strong>
            </header>
            <div className="public-fixture-list">
              {dateFixtures.map((fixture) => (
                <FixtureRow
                  fixture={fixture}
                  key={fixture.id}
                  timezone={league.timezone}
                />
              ))}
            </div>
          </section>
        ))}
        {!visibleFixtures.length ? (
          <div className="public-empty">
            <strong>No fixtures match these filters.</strong>
            <span>Try another competition, club or result state.</span>
          </div>
        ) : null}
      </div>
    </main>
  );
}

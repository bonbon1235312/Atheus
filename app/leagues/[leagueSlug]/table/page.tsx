import {
  getLeagueCompetitions,
  getLeagueSeasons,
  getPublicLeague,
  getStandings,
} from "@/lib/public-league-data";

import { StandingsTable } from "../_components/standings-table";

export const revalidate = 60;

type TablePageProps = {
  params: Promise<{ leagueSlug: string }>;
  searchParams: Promise<{ competition?: string; season?: string }>;
};

export default async function TablePage({
  params,
  searchParams,
}: TablePageProps) {
  const [{ leagueSlug }, query] = await Promise.all([params, searchParams]);
  const league = await getPublicLeague(leagueSlug);
  const seasons = await getLeagueSeasons(league.id);
  const selectedSeason =
    seasons.find((season) => season.id === query.season) ||
    seasons.find((season) => season.status === "active") ||
    seasons[0];
  const competitions = selectedSeason
    ? (await getLeagueCompetitions(league.id, selectedSeason.id)).filter(
        (competition) => competition.kind === "league",
      )
    : [];
  const selectedCompetition =
    competitions.find((competition) => competition.id === query.competition) ||
    competitions[0];
  const rows = await getStandings(
    leagueSlug,
    selectedSeason?.id,
    selectedCompetition?.id,
  );

  return (
    <main className="league-public-page public-index-page">
      <section className="public-page-heading">
        <p className="public-kicker">Standings</p>
        <h1>League table</h1>
        <p>
          Ranked by points, goal difference and goals scored using approved league
          results only.
        </p>
      </section>

      <form className="public-filter-bar public-filter-bar-short">
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
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Update table</button>
      </form>

      {rows.length ? (
        <StandingsTable leagueSlug={leagueSlug} rows={rows} />
      ) : (
        <div className="public-empty">
          <strong>No league table is available yet.</strong>
          <span>Add an active league competition and its clubs to begin.</span>
        </div>
      )}
    </main>
  );
}

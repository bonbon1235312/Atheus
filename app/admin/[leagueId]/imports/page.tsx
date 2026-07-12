import Link from "next/link";
import { notFound } from "next/navigation";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ReviewControls } from "./review-controls";

export const dynamic = "force-dynamic";

export default async function ImportsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "reviewer",
  ]);
  if (!access) {
    notFound();
  }

  const database = supabaseAdmin();
  const { data: imports, error } = await database
    .from("match_imports")
    .select(
      "id, fixture_id, confidence, status, played_at, home_score, away_score, collected_at",
    )
    .eq("league_id", leagueId)
    .eq("status", "pending")
    .order("collected_at", { ascending: false });

  if (error) {
    throw error;
  }

  const fixtureIds = [...new Set((imports ?? []).map((item) => item.fixture_id as string))];
  const importIds = (imports ?? []).map((item) => item.id as string);
  const [fixturesResult, rowsResult] = await Promise.all([
    fixtureIds.length
      ? database
          .from("fixtures")
          .select("id, kickoff_at, home_team_id, away_team_id")
          .eq("league_id", leagueId)
          .in("id", fixtureIds)
      : Promise.resolve({ data: [], error: null }),
    importIds.length
      ? database
          .from("match_import_player_rows")
          .select(
            "id, match_import_id, team_id, gamertag, position_code, goals, assists, rating, saves, tackles_made",
          )
          .eq("league_id", leagueId)
          .in("match_import_id", importIds)
          .order("rating", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (fixturesResult.error) {
    throw fixturesResult.error;
  }
  if (rowsResult.error) {
    throw rowsResult.error;
  }
  const fixtures = fixturesResult.data;
  const rows = rowsResult.data;
  const teamIds = [
    ...new Set(
      (fixtures ?? []).flatMap((fixture) => [
        fixture.home_team_id as string,
        fixture.away_team_id as string,
      ]),
    ),
  ];
  const teamsResult = teamIds.length
    ? await database
        .from("teams")
        .select("id, name, abbreviation")
        .eq("league_id", leagueId)
        .in("id", teamIds)
    : { data: [], error: null };
  if (teamsResult.error) {
    throw teamsResult.error;
  }
  const teams = teamsResult.data;
  const fixtureById = new Map((fixtures ?? []).map((fixture) => [fixture.id, fixture]));
  const teamById = new Map((teams ?? []).map((team) => [team.id, team]));

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>
        <Link className="header-link" href={`/admin/${leagueId}`}>
          Back to workspace
        </Link>
      </header>
      <section className="workspace-intro">
        <p className="eyebrow">Match control / {access.role}</p>
        <h1>Review imports.</h1>
        <p>
          Nothing reaches results, standings or player totals until one complete
          package is approved. Rejection leaves public data untouched.
        </p>
      </section>

      <section className="imports-shell">
        {(imports ?? []).length ? (
          imports?.map((item) => {
            const fixture = fixtureById.get(item.fixture_id);
            const home = fixture ? teamById.get(fixture.home_team_id) : null;
            const away = fixture ? teamById.get(fixture.away_team_id) : null;
            const playerRows = (rows ?? []).filter(
              (row) => row.match_import_id === item.id,
            );
            return (
              <article className="import-card" key={item.id as string}>
                <header>
                  <span className={`confidence confidence-${item.confidence}`}>
                    {item.confidence} stats
                  </span>
                  <small>
                    {fixture
                      ? new Intl.DateTimeFormat("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: access.timezone,
                        }).format(new Date(fixture.kickoff_at as string))
                      : "Fixture unavailable"}
                  </small>
                </header>
                <div className="import-score">
                  <strong>{home?.name ?? "Home"}</strong>
                  <b>
                    {item.home_score ?? "?"} - {item.away_score ?? "?"}
                  </b>
                  <strong>{away?.name ?? "Away"}</strong>
                </div>
                <div className="import-player-rows">
                  {playerRows.map((row) => (
                    <div key={row.id as string}>
                      <span>{row.gamertag as string}</span>
                      <small>{(teamById.get(row.team_id)?.abbreviation as string) ?? "?"}</small>
                      <small>{(row.position_code as string | null) ?? "-"}</small>
                      <b>{row.goals as number}G</b>
                      <b>{row.assists as number}A</b>
                      <b>{(row.rating as number | null) ?? "-"}</b>
                    </div>
                  ))}
                </div>
                <ReviewControls
                  canScoreOnlyOverride={
                    access.role === "owner" || access.role === "admin"
                  }
                  importId={item.id as string}
                  leagueId={leagueId}
                  scoreOnly={playerRows.length === 0}
                />
              </article>
            );
          })
        ) : (
          <p className="empty-state">
            No pending match packages. The collector will place definite,
            possible and ambiguous candidates here when it finds them.
          </p>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ClearDivisionForm } from "./clear-division-form";
import { FixtureControls } from "./fixture-controls";
import { FixtureGeneratorForm } from "./fixture-generator-form";

export const dynamic = "force-dynamic";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function localDateTimeInput(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export default async function FixturesAdminPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const session = await auth();
  if (!session?.discordUserId) {
    redirect("/admin");
  }

  const { leagueId } = await params;
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "reviewer",
    "fixture_manager",
  ]);
  if (!access) {
    notFound();
  }

  const database = supabaseAdmin();
  const [
    { data: seasons },
    { data: competitions },
    { data: allTeams },
    { data: links },
    { data: competitionTeams },
    { data: fixtures, count: fixtureCount },
  ] = await Promise.all([
    database
      .from("seasons")
      .select("id, name, starts_on, created_at")
      .eq("league_id", leagueId)
      .order("created_at", { ascending: false }),
    database
      .from("competitions")
      .select("id, season_id, name, kind, active")
      .eq("league_id", leagueId)
      .eq("active", true)
      .order("created_at"),
    database
      .from("teams")
      .select("id, name, abbreviation, status")
      .eq("league_id", leagueId)
      .order("name"),
    database
      .from("team_ea_club_links")
      .select("team_id")
      .eq("league_id", leagueId)
      .is("inactive_at", null),
    database
      .from("competition_teams")
      .select("competition_id, team_id")
      .eq("league_id", leagueId),
    database
      .from("fixtures")
      .select(
        "id, competition_id, gameday_number, round_label, kickoff_at, home_team_id, away_team_id, status, home_score, away_score, result_note",
        { count: "exact" },
      )
      .eq("league_id", leagueId)
      .order("kickoff_at")
      .limit(120),
  ]);
  const { data: allFixtureCompetitionRows } = await database
    .from("fixtures")
    .select("competition_id")
    .eq("league_id", leagueId);
  const fixtureIds = (fixtures ?? []).map((fixture) => fixture.id as string);
  const { data: matches } = fixtureIds.length
    ? await database
        .from("matches")
        .select("fixture_id, is_forfeit")
        .eq("league_id", leagueId)
        .in("fixture_id", fixtureIds)
    : { data: [] };

  const seasonById = new Map(
    (seasons ?? []).map((season) => [season.id as string, season]),
  );
  const teamById = new Map(
    (allTeams ?? []).map((team) => [team.id as string, team.name as string]),
  );
  const teams = (allTeams ?? []).filter((team) => team.status === "active");
  const linkedTeams = new Set((links ?? []).map((link) => link.team_id));
  const matchByFixtureId = new Map(
    (matches ?? []).map((match) => [match.fixture_id as string, match]),
  );
  const canManageSchedule = ["owner", "admin", "fixture_manager"].includes(
    access.role,
  );
  const canReviewResults = ["owner", "admin", "reviewer"].includes(access.role);
  const competitionOptions = (competitions ?? []).map((competition) => ({
    id: competition.id as string,
    name: competition.name as string,
    kind: competition.kind as string,
    seasonName:
      (seasonById.get(competition.season_id as string)?.name as
        | string
        | undefined) ?? "Season",
  }));
  const competitionAssignments = (competitionTeams ?? []).reduce<
    Record<string, string[]>
  >((map, row) => {
    const competitionId = row.competition_id as string;
    (map[competitionId] ??= []).push(row.team_id as string);
    return map;
  }, {});
  const fixtureCountByCompetition = (allFixtureCompetitionRows ?? []).reduce<
    Record<string, number>
  >((map, row) => {
    const competitionId = row.competition_id as string;
    map[competitionId] = (map[competitionId] ?? 0) + 1;
    return map;
  }, {});
  const clearableDivisions = competitionOptions
    .filter((competition) => (fixtureCountByCompetition[competition.id] ?? 0) > 0)
    .map((competition) => ({
      id: competition.id,
      name: competition.name,
      seasonName: competition.seasonName,
      fixtureCount: fixtureCountByCompetition[competition.id] ?? 0,
    }));
  const defaultFirstDate =
    (seasons?.[0]?.starts_on as string | null | undefined) ?? today();

  return (
    <main className="workspace-page fixtures-page">
      <header className="workspace-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>
        <Link className="header-link" href={`/admin/${leagueId}`}>
          Back to workspace
        </Link>
      </header>

      <section className="workspace-intro fixtures-intro">
        <p className="eyebrow">Fixtures / {access.leagueName}</p>
        <h1>Shape the season.</h1>
        <p>
          Generate a balanced round-robin against the league&apos;s real match
          windows. Preview every date before publishing anything.
        </p>
      </section>

      <section className="teams-shell">
        <div className="section-title-row">
          <p className="step-index">Schedule engine</p>
          <h2>Generate league fixtures</h2>
        </div>
        {canManageSchedule && competitionOptions.length && teams?.length ? (
          <FixtureGeneratorForm
            competitionAssignments={competitionAssignments}
            competitions={competitionOptions}
            defaultFirstDate={defaultFirstDate}
            leagueId={leagueId}
            teams={(teams ?? []).map((team) => ({
              id: team.id as string,
              name: team.name as string,
              abbreviation: team.abbreviation as string | null,
              eaReady: linkedTeams.has(team.id),
            }))}
          />
        ) : canManageSchedule ? (
          <p className="empty-state">
            Add an active season, competition and at least two teams before
            generating fixtures.
          </p>
        ) : (
          <p className="empty-state">
            Reviewer access can correct results and erase bad stat packages.
            Fixture generation remains limited to owners and fixture managers.
          </p>
        )}
        {canManageSchedule && clearableDivisions.length ? (
          <ClearDivisionForm
            divisions={clearableDivisions}
            leagueId={leagueId}
          />
        ) : null}
      </section>

      <section className="teams-shell">
        <div className="section-title-row">
          <p className="step-index">
            {fixtureCount ?? fixtures?.length ?? 0} published
          </p>
          <h2>Published fixtures</h2>
        </div>
        {fixtures?.length ? (
          <div className="published-fixtures">
            {fixtures.map((fixture) => {
              const approvedMatch = matchByFixtureId.get(fixture.id as string);
              return (
                <article key={fixture.id as string}>
                  <div className="published-fixture-row">
                    <span>
                      {fixture.round_label ??
                        `Gameday ${fixture.gameday_number ?? "-"}`}
                      <small>
                        {new Intl.DateTimeFormat("en-GB", {
                          timeZone: access.timezone,
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(fixture.kickoff_at as string))}
                      </small>
                    </span>
                    <strong>
                      {teamById.get(fixture.home_team_id as string) ?? "Unknown"}
                    </strong>
                    <b>
                      {fixture.home_score === null
                        ? "vs"
                        : `${fixture.home_score} - ${fixture.away_score}`}
                    </b>
                    <strong>
                      {teamById.get(fixture.away_team_id as string) ?? "Unknown"}
                    </strong>
                    <small>{fixture.status as string}</small>
                  </div>
                  {fixture.result_note ? (
                    <p className="fixture-result-note">
                      {fixture.result_note as string}
                    </p>
                  ) : null}
                  <FixtureControls
                    awayScore={fixture.away_score as number | null}
                    canManageSchedule={canManageSchedule}
                    canReviewResults={canReviewResults}
                    fixtureId={fixture.id as string}
                    homeScore={fixture.home_score as number | null}
                    isForfeit={Boolean(approvedMatch?.is_forfeit)}
                    leagueId={leagueId}
                    localKickoff={localDateTimeInput(
                      fixture.kickoff_at as string,
                      access.timezone,
                    )}
                    status={fixture.status as string}
                  />
                </article>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">No fixtures have been published yet.</p>
        )}
      </section>
    </main>
  );
}

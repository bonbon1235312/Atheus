import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TeamCreationForm, TeamList } from "./team-manager";

export const dynamic = "force-dynamic";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const session = await auth();
  if (!session?.discordUserId) {
    redirect("/admin");
  }

  const { leagueId } = await params;
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    notFound();
  }

  const database = supabaseAdmin();
  const [{ data: teams }, { data: links }] = await Promise.all([
    database
      .from("teams")
      .select(
        "id, name, abbreviation, discord_role_id, primary_colour, secondary_colour, created_at",
      )
      .eq("league_id", leagueId)
      .order("created_at"),
    database
      .from("team_ea_club_links")
      .select(
        "team_id, ea_club_id, ea_club_name, platform, verified_at, active_from",
      )
      .eq("league_id", leagueId)
      .is("inactive_at", null)
      .order("active_from", { ascending: false }),
  ]);

  const activeLinkByTeam = new Map(
    (links ?? []).map((link) => [link.team_id as string, link]),
  );
  const teamRows = (teams ?? []).map((team) => ({
    id: team.id as string,
    name: team.name as string,
    abbreviation: team.abbreviation as string | null,
    discord_role_id: team.discord_role_id as string | null,
    primary_colour: team.primary_colour as string | null,
    secondary_colour: team.secondary_colour as string | null,
    activeLink: activeLinkByTeam.get(team.id as string)
      ? {
          ea_club_id: activeLinkByTeam.get(team.id as string)!
            .ea_club_id as string,
          ea_club_name: activeLinkByTeam.get(team.id as string)!
            .ea_club_name as string,
          platform: activeLinkByTeam.get(team.id as string)!.platform as string,
          verified_at: activeLinkByTeam.get(team.id as string)!
            .verified_at as string | null,
        }
      : null,
  }));
  const linkedCount = teamRows.filter((team) => team.activeLink).length;

  return (
    <main className="workspace-page teams-page">
      <header className="workspace-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>
        <Link className="header-link" href={`/admin/${leagueId}`}>
          Back to workspace
        </Link>
      </header>

      <section className="workspace-intro teams-intro">
        <p className="eyebrow">Teams / {access.defaultPlatform}</p>
        <h1>Build the league roster.</h1>
        <p>
          Create each league team, then verify its EA identity. Historical links
          are retained when a club is replaced mid-season.
        </p>
      </section>

      <section className="team-readiness" aria-label="Team readiness">
        <div>
          <span>Total teams</span>
          <strong>{teamRows.length}</strong>
        </div>
        <div>
          <span>EA ready</span>
          <strong>{linkedCount}</strong>
        </div>
        <div>
          <span>Need links</span>
          <strong>{teamRows.length - linkedCount}</strong>
        </div>
      </section>

      <section className="teams-shell">
        <div className="section-title-row">
          <p className="step-index">New entry</p>
          <h2>Create a team</h2>
        </div>
        <TeamCreationForm
          defaultPlatform={access.defaultPlatform}
          leagueId={leagueId}
        />
      </section>

      <section className="teams-shell">
        <div className="section-title-row">
          <p className="step-index">{linkedCount} verified</p>
          <h2>League teams</h2>
        </div>
        <TeamList
          defaultPlatform={access.defaultPlatform}
          leagueId={leagueId}
          teams={teamRows}
        />
      </section>
    </main>
  );
}

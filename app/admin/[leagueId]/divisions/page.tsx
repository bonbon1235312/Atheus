import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

import { DivisionPanel } from "./division-panel";

export const dynamic = "force-dynamic";

export default async function DivisionsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const session = await auth();
  if (!session?.discordUserId) {
    redirect("/admin");
  }

  const { leagueId } = await params;
  const database = supabaseAdmin();

  const { data: membership } = await database
    .from("league_memberships")
    .select("role")
    .eq("league_id", leagueId)
    .eq("discord_user_id", session.discordUserId)
    .eq("active", true)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role as string)) {
    notFound();
  }

  const { data: league } = await database
    .from("leagues")
    .select("name")
    .eq("id", leagueId)
    .single();

  if (!league) {
    notFound();
  }

  const { data: seasons } = await database
    .from("seasons")
    .select("id, name, status")
    .eq("league_id", leagueId)
    .in("status", ["active", "draft"])
    .order("created_at", { ascending: false });

  const currentSeason = seasons?.[0] ?? null;

  const [divisionsResult, teamsResult, competitionTeamsResult] =
    await Promise.all([
      currentSeason
        ? database
            .from("competitions")
            .select("id, name, slug")
            .eq("league_id", leagueId)
            .eq("season_id", currentSeason.id)
            .eq("kind", "league")
            .eq("active", true)
            .order("name")
        : Promise.resolve({ data: [] }),
      database
        .from("teams")
        .select("id, name, primary_colour")
        .eq("league_id", leagueId)
        .eq("status", "active")
        .order("name"),
      currentSeason
        ? database
            .from("competition_teams")
            .select("competition_id, team_id")
            .eq("league_id", leagueId)
        : Promise.resolve({ data: [] }),
    ]);

  const divisions = (divisionsResult.data ?? []) as {
    id: string;
    name: string;
    slug: string;
  }[];
  const teams = (teamsResult.data ?? []) as {
    id: string;
    name: string;
    primary_colour: string | null;
  }[];
  const competitionTeams = (competitionTeamsResult.data ?? []) as {
    competition_id: string;
    team_id: string;
  }[];

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
        <p className="eyebrow">
          Divisions / {currentSeason?.name ?? "No active season"}
        </p>
        <h1>Organise your teams.</h1>
        <p>
          Create divisions and assign teams to them. Each division gets its own
          standings table on the public site and can have fixtures generated
          independently using the fixture manager.
        </p>
      </section>

      {!currentSeason ? (
        <div className="setup-shell">
          <p className="empty-state">
            Create a season first before setting up divisions.{" "}
            <Link href={`/admin/${leagueId}/setup`}>
              Configure season →
            </Link>
          </p>
        </div>
      ) : (
        <DivisionPanel
          competitionTeams={competitionTeams}
          divisions={divisions}
          leagueId={leagueId}
          seasonId={currentSeason.id}
          teams={teams}
        />
      )}
    </main>
  );
}

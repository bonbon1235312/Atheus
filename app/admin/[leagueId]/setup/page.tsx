import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SeasonForm } from "./season-form";

export const dynamic = "force-dynamic";

export default async function LeagueSetupPage({
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
    .in("role", ["owner", "admin"])
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const { data: league } = await database
    .from("leagues")
    .select("name, timezone")
    .eq("id", leagueId)
    .single();

  if (!league) {
    notFound();
  }

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

      <section className="workspace-intro setup-intro">
        <p className="eyebrow">Foundation / {league.timezone}</p>
        <h1>Set the match rhythm.</h1>
        <p>
          Define the opening season and the weekly windows in which games are
          expected. These windows later guide fixture generation and EA collection.
        </p>
      </section>

      <section className="setup-shell">
        <div className="section-title-row">
          <p className="step-index">{league.name}</p>
          <h2>Opening season</h2>
        </div>
        <SeasonForm leagueId={leagueId} />
      </section>
    </main>
  );
}

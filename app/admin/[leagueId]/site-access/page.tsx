import Link from "next/link";
import { notFound } from "next/navigation";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SiteAccessForm } from "./site-access-form";

export const dynamic = "force-dynamic";

export default async function SiteAccessSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ setup?: string }>;
}) {
  const { leagueId } = await params;
  const access = await requireLeagueAccess(leagueId, ["owner"]);
  if (!access || access.discordUserId.startsWith("site:")) {
    notFound();
  }

  const [{ data: credential }, query] = await Promise.all([
    supabaseAdmin()
      .from("league_site_credentials")
      .select("username, password_changed_at, last_signed_in_at")
      .eq("league_id", leagueId)
      .maybeSingle(),
    searchParams,
  ]);

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
        <p className="eyebrow">Site access / owner only</p>
        <h1>Control the second door.</h1>
        <p>
          Give trusted operators access without sharing your Discord account.
          The site credential always remains an administrator inside this one
          league and can never assume ownership.
        </p>
      </section>

      {query.setup === "required" ? (
        <p className="form-error">
          The league was created, but its initial site credential was not
          saved. Set it below before sharing staff access.
        </p>
      ) : null}

      <section className="site-access-summary">
        <div>
          <span>Current username</span>
          <strong>{credential?.username ?? "Not configured"}</strong>
        </div>
        <div>
          <span>Password changed</span>
          <strong>
            {credential?.password_changed_at
              ? new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                }).format(new Date(credential.password_changed_at as string))
              : "Never"}
          </strong>
        </div>
        <div>
          <span>Last site sign-in</span>
          <strong>
            {credential?.last_signed_in_at
              ? new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(credential.last_signed_in_at as string))
              : "No sign-ins"}
          </strong>
        </div>
      </section>

      <section className="teams-shell">
        <SiteAccessForm
          leagueId={leagueId}
          username={(credential?.username as string | null) ?? ""}
        />
      </section>
    </main>
  );
}

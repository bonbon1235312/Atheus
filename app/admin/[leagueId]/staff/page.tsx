import Link from "next/link";
import { notFound } from "next/navigation";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RemoveStaffForm } from "./remove-staff-form";
import { StaffForm } from "./staff-form";

export const dynamic = "force-dynamic";

const roleDescriptions: Record<string, string> = {
  owner: "Full control, activation and staff management",
  admin: "Season setup, teams and EA links",
  fixture_manager: "Fixture generation and scheduling",
  reviewer: "Match import review and approval",
};

export default async function StaffPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const access = await requireLeagueAccess(leagueId, ["owner"]);
  if (!access) {
    notFound();
  }

  const { data: memberships, error } = await supabaseAdmin()
    .from("league_memberships")
    .select("discord_user_id, role, active, created_at")
    .eq("league_id", leagueId)
    .order("created_at");

  if (error) {
    throw error;
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

      <section className="workspace-intro">
        <p className="eyebrow">Access control / owner only</p>
        <h1>League staff.</h1>
        <p>
          Grant the narrowest role each person needs. Staff access is stored by
          stable Discord user ID and every change is written to the audit log.
        </p>
      </section>

      <section className="setup-shell">
        <div className="section-title-row">
          <p className="step-index">Add access</p>
          <h2>Invite staff</h2>
        </div>
        <StaffForm leagueId={leagueId} />
      </section>

      <section className="setup-shell">
        <div className="section-title-row">
          <p className="step-index">{memberships?.length ?? 0} memberships</p>
          <h2>Current access</h2>
        </div>
        <div className="staff-list">
          {(memberships ?? []).map((membership) => (
            <article key={membership.discord_user_id as string}>
              <div>
                <strong>{membership.discord_user_id as string}</strong>
                <small>
                  {roleDescriptions[membership.role as string] ??
                    (membership.role as string)}
                </small>
              </div>
              <span
                className={
                  membership.active
                    ? "status-chip"
                    : "status-chip status-chip-warning"
                }
              >
                {membership.active ? membership.role : "inactive"}
              </span>
              {membership.role !== "owner" && membership.active ? (
                <RemoveStaffForm
                  discordUserId={membership.discord_user_id as string}
                  leagueId={leagueId}
                />
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

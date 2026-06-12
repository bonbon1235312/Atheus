import Link from "next/link";
import { notFound } from "next/navigation";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CollectorToggle } from "./collector-toggle";

export const dynamic = "force-dynamic";

function formatDate(value: string | null, timezone: string) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export default async function CollectorPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
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
    { data: settings },
    { data: runs },
    { count: pendingImports },
    { count: activeFixtures },
  ] = await Promise.all([
    database
      .from("league_settings")
      .select("collector_enabled, review_mode, default_match_type")
      .eq("league_id", leagueId)
      .single(),
    database
      .from("collector_runs")
      .select(
        "id, status, worker_id, started_at, finished_at, target_fixture_count, fetched_club_count, definite_count, possible_count, no_stats_count, access_denied_count, error_count, next_retry_at, last_error",
      )
      .eq("league_id", leagueId)
      .order("started_at", { ascending: false })
      .limit(12),
    database
      .from("match_imports")
      .select("id", { count: "exact", head: true })
      .eq("league_id", leagueId)
      .eq("status", "pending"),
    database
      .from("fixtures")
      .select("id", { count: "exact", head: true })
      .eq("league_id", leagueId)
      .in("status", ["scheduled", "collecting", "pending_review"]),
  ]);

  const latest = runs?.[0];
  const blocked =
    latest?.next_retry_at && new Date(latest.next_retry_at as string) > new Date();
  const health = !settings?.collector_enabled
    ? "Paused"
    : blocked
      ? "EA cooldown"
      : latest?.status === "failed"
        ? "Needs attention"
        : latest
          ? "Operational"
          : "Waiting for first window";

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
        <p className="eyebrow">Automation / {access.role}</p>
        <h1>Collector operations.</h1>
        <p>
          A fixture-aware view of the EA worker. It polls only during configured
          local match windows, backs off after access blocks, and sends every
          discovered package to review before publication.
        </p>
      </section>

      <section className="collector-overview">
        <div>
          <span>Current state</span>
          <strong>{health}</strong>
          <small>
            {settings?.collector_enabled
              ? `${settings.default_match_type} on ${access.defaultPlatform}`
              : "No EA requests will be made"}
          </small>
        </div>
        <div>
          <span>Review queue</span>
          <strong>{pendingImports ?? 0}</strong>
          <small>Packages awaiting a human decision</small>
        </div>
        <div>
          <span>Open fixtures</span>
          <strong>{activeFixtures ?? 0}</strong>
          <small>Scheduled or awaiting review</small>
        </div>
        <div>
          <span>Next retry</span>
          <strong>
            {blocked
              ? formatDate(latest.next_retry_at as string, access.timezone)
              : "Normal cycle"}
          </strong>
          <small>EA blocks trigger a quiet cooldown</small>
        </div>
      </section>

      <section className="collector-control">
        <div>
          <p className="eyebrow">Master switch</p>
          <h2>
            {settings?.collector_enabled
              ? "Automation is armed."
              : "Automation is paused."}
          </h2>
          <p>
            This does not run continuously. Atheus asks Supabase for active
            fixture windows first, then fetches each required EA club once per
            cycle.
          </p>
        </div>
        <CollectorToggle
          canManage={["owner", "admin"].includes(access.role)}
          enabled={Boolean(settings?.collector_enabled)}
          leagueId={leagueId}
        />
      </section>

      <section className="collector-runs">
        <div className="section-title-row">
          <p className="step-index">Run history</p>
          <h2>Recent worker cycles</h2>
        </div>
        {runs?.length ? (
          <div className="collector-run-list">
            {runs.map((run) => (
              <article key={run.id as string}>
                <div>
                  <span className={`run-state run-state-${run.status}`}>
                    {run.status as string}
                  </span>
                  <strong>
                    {formatDate(run.started_at as string, access.timezone)}
                  </strong>
                  <small>{(run.worker_id as string | null) ?? "Unknown worker"}</small>
                </div>
                <dl>
                  <div>
                    <dt>Targets</dt>
                    <dd>{run.target_fixture_count as number}</dd>
                  </div>
                  <div>
                    <dt>Fetched</dt>
                    <dd>{run.fetched_club_count as number}</dd>
                  </div>
                  <div>
                    <dt>Definite</dt>
                    <dd>{run.definite_count as number}</dd>
                  </div>
                  <div>
                    <dt>Possible</dt>
                    <dd>{run.possible_count as number}</dd>
                  </div>
                  <div>
                    <dt>No stats</dt>
                    <dd>{run.no_stats_count as number}</dd>
                  </div>
                  <div>
                    <dt>Errors</dt>
                    <dd>
                      {(run.error_count as number) +
                        (run.access_denied_count as number)}
                    </dd>
                  </div>
                </dl>
                {run.last_error ? (
                  <p className="collector-error">{run.last_error as string}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No collector run has been recorded yet. The first run appears when
            an enabled league enters one of its fixture windows.
          </p>
        )}
      </section>
    </main>
  );
}

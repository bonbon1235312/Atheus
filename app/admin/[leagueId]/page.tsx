import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { leaguePublicUrl } from "@/lib/public-url";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ActivationForm } from "./activation-form";

export const dynamic = "force-dynamic";

export default async function LeagueWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await auth();
  if (!session?.discordUserId) {
    redirect("/admin");
  }
  if (session.authMethod !== "league-admin") {
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

  if (!membership) {
    notFound();
  }

  const { data: league } = await database
    .from("leagues")
    .select("id, name, short_name, slug, status, timezone, default_platform")
    .eq("id", leagueId)
    .single();

  if (!league) {
    notFound();
  }
  const { created } = await searchParams;
  const publicUrl = leaguePublicUrl(league.slug as string);

  const { data: seasons } = await database
    .from("seasons")
    .select("id, name, status, starts_on, ends_on")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false });
  const currentSeason = seasons?.[0];
  const [
    { count: teamCount },
    { count: linkedTeamCount },
    { count: scheduleSlotCount },
    { data: primaryGuild },
  ] = await Promise.all([
    database
      .from("teams")
      .select("id", { count: "exact", head: true })
      .eq("league_id", leagueId)
      .eq("status", "active"),
    database
      .from("team_ea_club_links")
      .select("team_id", { count: "exact", head: true })
      .eq("league_id", leagueId)
      .is("inactive_at", null),
    database
      .from("league_schedule_slots")
      .select("id", { count: "exact", head: true })
      .eq("league_id", leagueId)
      .eq("active", true),
    database
      .from("league_discord_guilds")
      .select("discord_guild_id")
      .eq("league_id", leagueId)
      .eq("is_primary", true)
      .is("unlinked_at", null)
      .maybeSingle(),
  ]);
  const readiness = [
    {
      label: "Discord home",
      ready: Boolean(primaryGuild?.discord_guild_id),
      detail: primaryGuild?.discord_guild_id
        ? "Primary server linked"
        : "Primary server missing",
    },
    {
      label: "Season",
      ready: Boolean(currentSeason),
      detail: currentSeason?.name ?? "Opening season missing",
    },
    {
      label: "Match windows",
      ready: (scheduleSlotCount ?? 0) > 0,
      detail: `${scheduleSlotCount ?? 0} active slot${scheduleSlotCount === 1 ? "" : "s"}`,
    },
    {
      label: "Teams",
      ready: (teamCount ?? 0) >= 2,
      detail: `${teamCount ?? 0} active team${teamCount === 1 ? "" : "s"}`,
    },
    {
      label: "EA automation",
      ready:
        (teamCount ?? 0) >= 2 && linkedTeamCount === teamCount,
      detail: `${linkedTeamCount ?? 0} of ${teamCount ?? 0} teams linked`,
    },
  ];
  const structurallyReady = readiness.every((item) => item.ready);

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>
        {session.authMethod === "league-admin" ? (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/site-login" });
            }}
          >
            <button className="text-button" type="submit">
              Sign out
            </button>
          </form>
        ) : (
          <Link className="header-link" href="/admin">
            All leagues
          </Link>
        )}
      </header>

      <section className="workspace-intro">
        <p className="eyebrow">League workspace / {membership.role}</p>
        <h1>{league.name}</h1>
        <p>
          Configure the operating pieces below, then pass the activation gate.
          Discord ownership and bot presence are rechecked at the exact moment
          the league becomes active.
        </p>
      </section>

      {created === league.slug ? (
        <section className="league-created-banner">
          <div>
            <p className="eyebrow">League created</p>
            <h2>Your league address is ready.</h2>
            <p>
              Share this address after activation. It remains attached to this
              league workspace.
            </p>
          </div>
          <a href={publicUrl} rel="noreferrer" target="_blank">
            {publicUrl}
          </a>
        </section>
      ) : null}

      <section className="workspace-grid">
        <article>
          <span>01</span>
          <h2>Identity</h2>
          <dl>
            <div>
              <dt>Address</dt>
              <dd>
                <a href={publicUrl} rel="noreferrer" target="_blank">
                  {league.slug}.atheus.dev
                </a>
              </dd>
            </div>
            <div>
              <dt>Timezone</dt>
              <dd>{league.timezone}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{league.default_platform}</dd>
            </div>
            <div>
              <dt>Discord home</dt>
              <dd>{primaryGuild?.discord_guild_id ?? "Not linked"}</dd>
            </div>
          </dl>
        </article>
        <article>
          <span>02</span>
          <h2>{currentSeason ? currentSeason.name : "Next setup"}</h2>
          {currentSeason ? (
            <>
              <p>
                Season foundation saved. The next module will add teams and EA
                club links before fixture generation is enabled.
              </p>
              <span className="status-chip">{currentSeason.status}</span>
            </>
          ) : (
            <>
              <p>
                Create the opening season and define the exact weekdays and time
                windows in which the collector should search.
              </p>
              {["owner", "admin"].includes(membership.role) ? (
                <Link
                  className="button button-primary"
                  href={`/admin/${leagueId}/setup`}
                >
                  Configure season
                </Link>
              ) : (
                <span className="status-chip">Owner setup required</span>
              )}
            </>
          )}
        </article>
        <article>
          <span>03</span>
          <h2>Teams</h2>
          <p>
            {teamCount
              ? `${linkedTeamCount ?? 0} of ${teamCount} active teams have a verified EA club link.`
              : "Create the league roster, then verify each team's EA club identity."}
          </p>
          {["owner", "admin"].includes(membership.role) ? (
            <Link
              className="button button-primary"
              href={`/admin/${leagueId}/teams`}
            >
              Manage teams
            </Link>
          ) : (
            <span className="status-chip">Owner setup required</span>
          )}
        </article>
        <article>
          <span>04</span>
          <h2>Fixtures</h2>
          <p>
            Preview a balanced league schedule across the configured local
            match days and kickoff slots, then publish it atomically.
          </p>
          {["owner", "admin", "fixture_manager"].includes(membership.role) ? (
            <Link
              className="button button-primary"
              href={`/admin/${leagueId}/fixtures`}
            >
              Manage fixtures
            </Link>
          ) : (
            <span className="status-chip">Fixture access required</span>
          )}
        </article>
        <article>
          <span>05</span>
          <h2>Staff</h2>
          <p>
            Give admins, fixture managers and match reviewers only the access
            their role requires. The owner remains protected.
          </p>
          {membership.role === "owner" ? (
            <Link
              className="button button-primary"
              href={`/admin/${leagueId}/staff`}
            >
              Manage staff
            </Link>
          ) : (
            <span className="status-chip">Owner access required</span>
          )}
        </article>
        <article>
          <span>06</span>
          <h2>Match review</h2>
          <p>
            Inspect discovered scores and player rows. Approval publishes one
            complete package to results, standings and player totals.
          </p>
          {["owner", "admin", "reviewer"].includes(membership.role) ? (
            <Link
              className="button button-primary"
              href={`/admin/${leagueId}/imports`}
            >
              Review imports
            </Link>
          ) : (
            <span className="status-chip">Reviewer access required</span>
          )}
        </article>
        <article>
          <span>07</span>
          <h2>Collector</h2>
          <p>
            Monitor fixture discovery, EA cooldowns, run counts and the review
            queue without exposing operational controls in Discord.
          </p>
          <Link
            className="button button-primary"
            href={`/admin/${leagueId}/collector`}
          >
            View operations
          </Link>
        </article>
        <article>
          <span>08</span>
          <h2>Public league</h2>
          <p>
            Preview the league-branded home, fixtures, standings, club pages and
            verified player leaderboards.
          </p>
          {league.status === "active" ? (
            <Link
              className="button button-primary"
              href={publicUrl}
            >
              Open public site
            </Link>
          ) : (
            <span className="status-chip">Available after activation</span>
          )}
        </article>
        <article>
          <span>09</span>
          <h2>Player registry</h2>
          <p>
            Search aliases, correct canonical gamertags, connect Discord
            identities and safely merge duplicate careers.
          </p>
          {["owner", "admin", "reviewer"].includes(membership.role) ? (
            <Link
              className="button button-primary"
              href={`/admin/${leagueId}/players`}
            >
              Manage players
            </Link>
          ) : (
            <span className="status-chip">Reviewer access required</span>
          )}
        </article>
        {membership.role === "owner" ? (
          <article>
            <span>10</span>
            <h2>Site access</h2>
            <p>
              Create or rotate the league-specific administrator login without
              sharing your Discord account.
            </p>
            <Link
              className="button button-primary"
              href={`/admin/${leagueId}/site-access`}
            >
              Manage site login
            </Link>
          </article>
        ) : null}
      </section>

      <section className="readiness-shell">
        <div className="section-title-row">
          <p className="step-index">Activation gate</p>
          <h2>{league.status === "active" ? "League is live" : "Ready to launch?"}</h2>
        </div>
        <div className="readiness-list">
          {readiness.map((item) => (
            <div key={item.label}>
              <span
                className={
                  item.ready
                    ? "readiness-indicator readiness-ready"
                    : "readiness-indicator"
                }
              >
                {item.ready ? "Ready" : "Blocked"}
              </span>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </div>
          ))}
        </div>
        {league.status === "active" ? (
          <p className="form-success">
            This league is active. Public views and league-aware automation may
            consume its approved data.
          </p>
        ) : membership.role === "owner" ? (
          <ActivationForm leagueId={leagueId} ready={structurallyReady} />
        ) : (
          <p className="empty-state">
            Only the league owner can complete the final Discord recheck and
            activate this workspace.
          </p>
        )}
      </section>
    </main>
  );
}

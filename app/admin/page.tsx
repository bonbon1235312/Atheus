import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signIn, signOut } from "@/auth";
import {
  getAtheusBotInviteUrl,
  getManagedDiscordGuilds,
} from "@/lib/discord";
import { getLeaguesForDiscordUser } from "@/lib/leagues";
import {
  getPlatformEntitlement,
  hasActivePremium,
} from "@/lib/entitlements";
import { leaguePublicUrl } from "@/lib/public-url";
import { OnboardingForm } from "./onboarding-form";

export const metadata = {
  title: "League access",
};

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await auth();

  if (session?.authMethod === "league-admin" && session.siteLeagueId) {
    redirect(
      leaguePublicUrl(session.siteLeagueSlug ?? "", "admin"),
    );
  }

  if (!session) {
    return (
      <main className="access-page">
        <Link className="wordmark" href="/" aria-label="Atheus home">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>

        <section className="access-panel">
          <p className="eyebrow">League administration</p>
          <h1>Enter through Discord.</h1>
          <p>
            Your Discord identity proves which servers you manage and which
            league workspaces you can access.
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("discord", { redirectTo: "/admin" });
            }}
          >
            <button className="button button-primary" type="submit">
              Continue with Discord
            </button>
          </form>
          <Link className="site-login-link" href="/admin/site-login">
            Sign in with a league site account
          </Link>
        </section>
      </main>
    );
  }

  const [leagues, guilds, entitlement] =
    session.discordUserId && session.discordAccessToken
      ? await Promise.all([
          getLeaguesForDiscordUser(session.discordUserId),
          getManagedDiscordGuilds(session.discordAccessToken),
          getPlatformEntitlement(session.discordUserId),
        ])
      : [[], [], null];
  const inviteBaseUrl = getAtheusBotInviteUrl();
  const premium = hasActivePremium(entitlement);
  const creationBlocked = Boolean(entitlement?.creation_blocked_at);
  const freeClaimUsed = Boolean(entitlement?.free_claimed_at);
  const { created } = await searchParams;
  const createdLeague = leagues.find((league) => league.slug === created);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="wordmark" href="/" aria-label="Atheus home">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>
        <div className="admin-identity">
          <span>{session.user?.name ?? "Discord user"}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="admin-intro">
        <p className="eyebrow">League administration</p>
        <h1>Build the operating system.</h1>
        <p>
          Start with the Discord server that owns the league. Atheus keeps every
          later season, fixture, result and player record inside that boundary.
        </p>
      </section>

      {createdLeague ? (
        <section className="league-created-banner">
          <div>
            <p className="eyebrow">League created</p>
            <h2>Your league website is ready.</h2>
            <p>
              League operations now live behind the administrator login on the
              league website, separate from this Atheus account area.
            </p>
          </div>
          <a
            href={leaguePublicUrl(createdLeague.slug, "admin")}
            rel="noreferrer"
            target="_blank"
          >
            {leaguePublicUrl(createdLeague.slug, "admin")}
          </a>
        </section>
      ) : null}

      {leagues.length ? (
        <section className="league-list" aria-labelledby="existing-leagues">
          <div className="section-title-row">
            <p className="step-index">Existing workspaces</p>
            <h2 id="existing-leagues">Continue a league</h2>
          </div>
          <div>
            {leagues.map((league) => (
              <Link
                className="league-row"
                href={
                  league.siteCredentialConfigured
                    ? leaguePublicUrl(league.slug, "admin")
                    : `/admin/${league.id}/site-access?setup=required`
                }
                key={league.id}
              >
                <span>{league.short_name ?? league.name.slice(0, 3)}</span>
                <strong>{league.name}</strong>
                <small>{league.role}</small>
                <small>
                  {league.siteCredentialConfigured
                    ? "Open site admin"
                    : "Set admin login"}
                </small>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="onboarding-shell">
        <div className="section-title-row">
          <p className="step-index">New workspace</p>
          <h2>Onboard a league</h2>
        </div>

        <div className="entitlement-strip">
          <div>
            <span>Current plan</span>
            <strong>{premium ? "Premium" : "Free"}</strong>
            <small>
              {premium
                ? "Unlimited leagues, priority support"
                : "One active league, full feature set"}
            </small>
          </div>
          <div>
            <span>League allowance</span>
            <strong>{premium ? "Unlimited" : "One lifetime"}</strong>
            <small>
              {premium
                ? "Create as many leagues as you need"
                : "Your free league does not reset if deleted"}
            </small>
          </div>
          <div>
            <span>Free claim</span>
            <strong>{freeClaimUsed ? "Used" : "Available"}</strong>
            <small>
              {freeClaimUsed
                ? "Your free league has been created"
                : "Create your first league below"}
            </small>
          </div>
        </div>

        {session.discordTokenError ? (
          <p className="form-error">
            Your Discord connection expired. Sign out and reconnect before
            continuing.
          </p>
        ) : creationBlocked ? (
          <p className="form-error">
            League creation is blocked for this account. Existing league access is
            unaffected; contact Atheus support for review.
          </p>
        ) : freeClaimUsed && !premium ? (
          <p className="empty-state">
            Your lifetime free league has already been claimed. Deleting or archiving
            it does not reset the allowance. Premium league creation will be enabled
            through verified billing, not a client-side switch.
          </p>
        ) : guilds.length ? (
          <OnboardingForm
            guilds={guilds}
            inviteBaseUrl={inviteBaseUrl}
            premium={premium}
          />
        ) : (
          <p className="empty-state">
            Discord did not return a server where you have Manage Server
            permission. Check your permissions, then reconnect.
          </p>
        )}
      </section>
    </main>
  );
}

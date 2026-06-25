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
        <section className="access-panel">
          <Link className="wordmark access-wordmark-inline" href="/" aria-label="Atheus home">
            <span className="wordmark-mark">A</span>
            <span>ATHEUS</span>
          </Link>

          <div className="access-panel-body">
            <div className="access-copy">
              <p className="eyebrow">League administration</p>
              <h1>Your league starts here.</h1>
              <p>
                Sign in with Discord to access your league workspaces. Atheus
                uses your server membership to verify which leagues you own and
                manage — no extra accounts needed.
              </p>
              <ul className="access-value-list">
                <li>Your public league site at yourleague.atheus.dev</li>
                <li>Automatic EA result collection and verification</li>
                <li>Live fixtures, standings and player stats</li>
                <li>Scoped to your Discord server — nothing leaks between leagues</li>
              </ul>
            </div>

            <div className="access-auth">
              <form
                action={async () => {
                  "use server";
                  await signIn("discord", { redirectTo: "/admin" });
                }}
              >
                <button className="button button-primary access-discord-btn" type="submit">
                  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" aria-hidden="true">
                    <path d="M16.942 1.556A16.3 16.3 0 0 0 12.82.295a.061.061 0 0 0-.064.03c-.175.311-.369.716-.505 1.033a15.049 15.049 0 0 0-4.5 0 10.508 10.508 0 0 0-.513-1.033.063.063 0 0 0-.064-.03 16.261 16.261 0 0 0-4.12 1.261.057.057 0 0 0-.026.022C.533 5.117-.32 8.577.099 11.99a.066.066 0 0 0 .025.045 16.4 16.4 0 0 0 4.94 2.488.063.063 0 0 0 .068-.022 11.69 11.69 0 0 0 1.01-1.641.061.061 0 0 0-.033-.085 10.8 10.8 0 0 1-1.543-.735.062.062 0 0 1-.006-.103c.104-.078.207-.158.307-.24a.061.061 0 0 1 .063-.008c3.24 1.478 6.745 1.478 9.945 0a.06.06 0 0 1 .064.007c.1.082.203.163.308.241a.062.062 0 0 1-.005.103c-.493.287-1.006.532-1.544.734a.061.061 0 0 0-.033.086c.298.579.64 1.127 1.01 1.64a.062.062 0 0 0 .068.023 16.36 16.36 0 0 0 4.95-2.488.063.063 0 0 0 .025-.044c.5-5.177-.838-9.674-3.549-13.667a.049.049 0 0 0-.025-.021Z" fill="currentColor"/>
                  </svg>
                  Continue with Discord
                </button>
              </form>
              <Link className="site-login-link" href="/admin/site-login">
                Sign in with a league site account instead
              </Link>
              <a
                className="access-support-link"
                href="https://discord.gg/dPrMMc82bf"
                rel="noreferrer"
                target="_blank"
              >
                Need help? Join the support Discord
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [leagues, guilds, entitlement] =
    session.discordUserId && session.discordAccessToken && !session.discordTokenError
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
            it does not reset the allowance.{" "}
            <Link href="/upgrade">Upgrade to Premium</Link> to create additional
            leagues.
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

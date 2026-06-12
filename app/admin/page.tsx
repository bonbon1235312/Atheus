import Link from "next/link";

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
import { OnboardingForm } from "./onboarding-form";

export const metadata = {
  title: "League access",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

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
                href={`/admin/${league.id}`}
                key={league.id}
              >
                <span>{league.short_name ?? league.name.slice(0, 3)}</span>
                <strong>{league.name}</strong>
                <small>{league.role}</small>
                <small>{league.status}</small>
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
          </div>
          <div>
            <span>League allowance</span>
            <strong>{premium ? "Unlimited" : "One lifetime"}</strong>
          </div>
          <div>
            <span>Free claim</span>
            <strong>{freeClaimUsed ? "Used" : "Available"}</strong>
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

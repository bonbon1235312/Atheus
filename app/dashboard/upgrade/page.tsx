import { auth } from "@/auth";
import {
  fetchUserGuilds,
  canManage,
  guildIconUrl,
  type DiscordGuild,
} from "@/lib/discord";
import { getActivePremiumGuildIds, getAccountPremium } from "@/lib/guild-config";

export const metadata = {
  title: "Upgrade",
  robots: { index: false, follow: false },
};

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.accessToken) return null; // layout renders the login screen

  const manageable = (await fetchUserGuilds(session.accessToken)).filter(canManage);

  let premiumSet = new Set<string>();
  try {
    premiumSet = await getActivePremiumGuildIds();
  } catch {
    premiumSet = new Set<string>();
  }

  let allAccess = false;
  if (session.discordId) {
    try {
      allAccess = (await getAccountPremium(session.discordId)).active;
    } catch {
      allAccess = false;
    }
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-3xl">
        <p className="kicker">Upgrade</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
          Choose what to upgrade.
        </h1>
        <p className="mt-5 text-lg text-chalk/64">
          Upgrade a single server, or get All-Access to cover every server you own.
        </p>

        {/* All-Access */}
        <div className="mt-10 rounded-2xl border border-blurpleHi/30 bg-acid/[0.08] p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-blurpleHi">
                All-Access
              </p>
              <p className="type-display mt-2 text-3xl font-semibold">
                £15<span className="text-lg font-medium text-chalk/45">/mo</span>
              </p>
              <p className="mt-1 text-chalk/60">Every server you own, one bill.</p>
            </div>
            {allAccess ? (
              <span className="rounded-full border border-blurpleHi/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blurpleHi">
                Active
              </span>
            ) : (
              <a href="/api/billing/checkout?scope=account" className="studio-button studio-button-primary">
                Get All-Access
              </a>
            )}
          </div>
        </div>

        {/* Per-server list */}
        <h2 className="type-display mt-12 text-2xl font-semibold tracking-tight">
          Or upgrade one server (£5/mo each)
        </h2>

        {manageable.length === 0 ? (
          <p className="mt-5 text-chalk/60">
            We couldn&apos;t find any servers where you have Manage Server permission.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3">
            {manageable.map((g) => (
              <ServerRow
                key={g.id}
                guild={g}
                pro={premiumSet.has(g.id)}
                coveredByAllAccess={allAccess && g.owner}
              />
            ))}
          </ul>
        )}

        <p className="mt-8 text-sm text-chalk/45">
          Have a 100%-off code? Enter it at checkout. Cancel anytime.
        </p>
      </div>
    </main>
  );
}

function ServerRow({
  guild,
  pro,
  coveredByAllAccess,
}: {
  guild: DiscordGuild;
  pro: boolean;
  coveredByAllAccess: boolean;
}) {
  const icon = guildIconUrl(guild);
  const initials = guild.name.slice(0, 2).toUpperCase();
  const isPro = pro || coveredByAllAccess;

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-white/12 bg-graphite p-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black">
            {initials}
          </span>
        )}
        <span className="truncate font-semibold">{guild.name}</span>
      </div>

      {isPro ? (
        <span className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-blurpleHi">
          {coveredByAllAccess ? "All-Access" : "Pro"}
        </span>
      ) : (
        <a
          href={`/api/billing/checkout?guild=${guild.id}`}
          className="studio-button studio-button-secondary shrink-0"
        >
          Upgrade
        </a>
      )}
    </li>
  );
}

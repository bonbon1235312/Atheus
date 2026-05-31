import Link from "next/link";
import { auth } from "@/auth";
import {
  fetchUserGuilds,
  canManage,
  guildIconUrl,
  inviteUrl,
  type DiscordGuild,
} from "@/lib/discord";
import { botGuildIds } from "@/lib/guild-config";
import { DISCORD_SERVER_URL } from "@/lib/site";

export default async function DashboardHome() {
  const session = await auth();
  // The layout guarantees a session, but guard for types / direct hits.
  if (!session?.accessToken) return null;

  const manageable = (await fetchUserGuilds(session.accessToken)).filter(canManage);

  // Which of those already have the bot? (best-effort — empty if Supabase is down)
  let botSet = new Set<string>();
  try {
    botSet = await botGuildIds();
  } catch {
    botSet = new Set<string>();
  }

  const withBot = manageable.filter((g) => botSet.has(g.id));
  const withoutBot = manageable.filter((g) => !botSet.has(g.id));

  return (
    <main className="section-pad">
      <div className="container-studio">
        <p className="kicker">Your servers</p>
        <h1 className="type-display mt-4 text-5xl font-semibold leading-[0.98] md:text-7xl">
          Pick a server to configure.
        </h1>

        {manageable.length === 0 && (
          <p className="mt-8 max-w-xl text-lg text-chalk/68">
            We couldn&apos;t find any servers where you have Manage Server
            permission. You need to own or co-manage a server to set up atheus.
          </p>
        )}

        {withBot.length > 0 && (
          <section className="mt-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
              atheus is in these
            </p>
            <div className="mt-5 grid gap-px bg-white/12 md:grid-cols-2 lg:grid-cols-3">
              {withBot.map((g) => (
                <GuildCard key={g.id} guild={g} hasBot />
              ))}
            </div>
          </section>
        )}

        {withoutBot.length > 0 && (
          <section className="mt-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-chalk/50">
              Add atheus to these
            </p>
            <div className="mt-5 grid gap-px bg-white/12 md:grid-cols-2 lg:grid-cols-3">
              {withoutBot.map((g) => (
                <GuildCard key={g.id} guild={g} hasBot={false} />
              ))}
            </div>
          </section>
        )}
        {/* Support chip */}
        <div className="mt-16 flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-5 py-4 text-sm text-chalk/60">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#5865F2]" />
          <span>Need help setting something up?</span>
          <a
            href={DISCORD_SERVER_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-auto shrink-0 font-semibold text-chalk transition-colors hover:text-[#5865F2]"
          >
            Join our support server →
          </a>
        </div>
      </div>
    </main>
  );
}

function GuildCard({ guild, hasBot }: { guild: DiscordGuild; hasBot: boolean }) {
  const icon = guildIconUrl(guild);
  const initials = guild.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-4 bg-ink p-5">
      <div className="flex min-w-0 items-center gap-4">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black">
            {initials}
          </span>
        )}
        <span className="truncate text-lg font-semibold">{guild.name}</span>
      </div>

      {hasBot ? (
        <Link
          href={`/dashboard/${guild.id}`}
          className="studio-button studio-button-secondary shrink-0"
        >
          Configure
        </Link>
      ) : (
        <a
          href={inviteUrl(guild.id)}
          className="studio-button studio-button-primary shrink-0"
          target="_blank"
          rel="noreferrer"
        >
          Add atheus
        </a>
      )}
    </div>
  );
}

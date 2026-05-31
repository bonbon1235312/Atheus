import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getAfkWeb } from "@/lib/guild-config";
import { fetchDiscordUsers } from "@/lib/discord";

type Params = { params: Promise<{ guildId: string }> };

export default async function AfkPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const rows = await getAfkWeb(guildId);
  const users = await fetchDiscordUsers(rows.map((r) => r.user_id));

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">AFK</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Who&apos;s away.</h1>
        <p className="mt-5 text-chalk/64">Members set this with <code>/afk set</code>; it clears when they next chat.</p>

        {rows.length === 0 ? (
          <p className="mt-8 text-chalk/55">Nobody is AFK right now.</p>
        ) : (
          <ul className="mt-8 grid gap-2">
            {rows.map((r) => (
              <li key={r.user_id} className="flex items-center justify-between gap-4 rounded-xl border border-white/12 bg-graphite px-4 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={users.get(r.user_id)?.avatarUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png"} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full" />
                  <span className="min-w-0">
                    <span className="block text-chalk/85">{users.get(r.user_id)?.displayName ?? r.user_id}</span>
                    <span className="block truncate text-sm text-chalk/55">{r.reason}</span>
                  </span>
                </span>
                <span className="type-mono shrink-0 text-xs text-chalk/40">{new Date(r.set_at).toLocaleString("en-GB")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

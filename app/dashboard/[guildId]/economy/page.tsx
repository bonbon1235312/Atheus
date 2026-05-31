import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getTopBalances } from "@/lib/guild-config";
import { fetchDiscordUsers } from "@/lib/discord";

type Params = { params: Promise<{ guildId: string }> };

export default async function EconomyPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const rows = await getTopBalances(guildId, 15);
  const users = await fetchDiscordUsers(rows.map((r) => r.user_id));

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Economy</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Richest members.</h1>
        <p className="mt-5 text-chalk/64">Coins earned from <code>/daily</code> and games. Managed in Discord.</p>

        {rows.length === 0 ? (
          <p className="mt-8 text-chalk/55">No coins yet.</p>
        ) : (
          <ol className="mt-8 grid gap-2">
            {rows.map((r, i) => (
              <li key={r.user_id} className="flex items-center justify-between rounded-xl border border-white/12 bg-graphite px-4 py-3">
                <span className="flex items-center gap-3">
                  <span className="w-6 text-sm text-chalk/45">#{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={users.get(r.user_id)?.avatarUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png"} alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
                  <span className="text-chalk/85">{users.get(r.user_id)?.displayName ?? r.user_id}</span>
                </span>
                <span className="type-mono text-sm text-blurpleHi">🪙 {r.balance.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

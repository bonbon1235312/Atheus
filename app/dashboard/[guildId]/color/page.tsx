import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getColorRolesWeb } from "@/lib/guild-config";
import { fetchDiscordUsers } from "@/lib/discord";

type Params = { params: Promise<{ guildId: string }> };

export default async function ColorPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const rows = await getColorRolesWeb(guildId);
  const users = await fetchDiscordUsers(rows.map((r) => r.userId));

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Color roles</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Name colours.</h1>
        <p className="mt-5 text-chalk/64">Members set their own with <code>/color set</code>. Here&apos;s who has one.</p>

        {rows.length === 0 ? (
          <p className="mt-8 text-chalk/55">No colour roles yet.</p>
        ) : (
          <ul className="mt-8 grid gap-2">
            {rows.map((r) => (
              <li key={r.userId} className="flex items-center justify-between rounded-xl border border-white/12 bg-graphite px-4 py-3">
                <span className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={users.get(r.userId)?.avatarUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png"} alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
                  <span className="text-chalk/85">{users.get(r.userId)?.displayName ?? r.userId}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: r.color }} />
                  <span className="type-mono text-sm text-chalk/60">{r.color}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

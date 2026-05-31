import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getInviteLeaderboardWeb } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function InvitesPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const rows = await getInviteLeaderboardWeb(guildId, 20);

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Invites</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Top inviters.</h1>
        <p className="mt-5 text-chalk/64">Who has brought the most members to {guild.name}.</p>

        {rows.length === 0 ? (
          <p className="mt-8 text-chalk/55">No tracked invites yet. They start counting once the bot is in the server.</p>
        ) : (
          <ol className="mt-8 grid gap-2">
            {rows.map((r, i) => (
              <li key={r.inviterId} className="flex items-center justify-between rounded-xl border border-white/12 bg-graphite px-4 py-3">
                <span className="text-chalk/85">#{i + 1} · {r.inviterId}</span>
                <span className="type-mono text-sm text-blurpleHi">{r.count} invite{r.count === 1 ? "" : "s"}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

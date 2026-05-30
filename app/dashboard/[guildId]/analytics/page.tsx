import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getAnalyticsSummary } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function AnalyticsPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const a = await getAnalyticsSummary(guildId);

  const net7 = a.joins7 - a.leaves7;
  const net30 = a.joins30 - a.leaves30;

  const stats = [
    { label: "Joins, 7 days", value: a.joins7 },
    { label: "Joins, 30 days", value: a.joins30 },
    { label: "Leaves, 7 days", value: a.leaves7 },
    { label: "Leaves, 30 days", value: a.leaves30 },
    { label: "Net, 7 days", value: net7 >= 0 ? `+${net7}` : net7 },
    { label: "Net, 30 days", value: net30 >= 0 ? `+${net30}` : net30 },
  ];

  return (
    <main className="section-pad">
      <div className="container-studio max-w-3xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          ← {guild.name}
        </Link>
        <p className="kicker mt-6">Analytics</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
          How your server is growing.
        </h1>
        <p className="mt-5 text-chalk/64">
          Member joins and leaves tracked since atheus joined. History grows over time.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/12 bg-graphite p-6">
              <p className="type-display text-4xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-2 text-sm text-chalk/55">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

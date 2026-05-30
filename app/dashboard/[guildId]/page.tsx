import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";

type Params = { params: Promise<{ guildId: string }> };

const features = [
  {
    key: "join-role",
    name: "Join role",
    desc: "Automatically give a role to every new member.",
    href: (id: string) => `/dashboard/${id}/join-role`,
    live: true,
  },
  {
    key: "reaction-roles",
    name: "Reaction roles",
    desc: "React to get a role.",
    href: (id: string) => `/dashboard/${id}/reaction-role`,
    live: true,
  },
  {
    key: "welcome",
    name: "Welcome",
    desc: "Post a welcome message when someone joins.",
    href: (id: string) => `/dashboard/${id}/welcome`,
    live: true,
  },
  { key: "tickets", name: "Tickets", desc: "Support tickets with web transcripts.", live: false },
  { key: "forms", name: "Forms & applications", desc: "Build applications members fill in.", live: false },
  { key: "giveaways", name: "Giveaways", desc: "Run giveaways with one command.", live: false },
  { key: "analytics", name: "Analytics", desc: "See how your server is growing.", live: false },
];

export default async function GuildOverview({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);

  return (
    <main className="section-pad">
      <div className="container-studio">
        <Link href="/dashboard" className="studio-link text-sm">
          ← All servers
        </Link>
        <p className="kicker mt-6">Configuring</p>
        <h1 className="type-display mt-4 text-5xl font-semibold leading-[0.98] md:text-7xl">
          {guild.name}
        </h1>

        <div className="mt-12 grid gap-px bg-white/12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const card = (
              <div className="flex h-full flex-col justify-between bg-ink p-6">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-black">{f.name}</h2>
                    {!f.live && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-chalk/40">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-chalk/65">{f.desc}</p>
                </div>
                {f.live && <span className="studio-link mt-8 text-sm">Configure →</span>}
              </div>
            );

            return f.live && f.href ? (
              <Link
                key={f.key}
                href={f.href(guildId)}
                className="group transition-colors hover:bg-acid/5"
              >
                {card}
              </Link>
            ) : (
              <div key={f.key} className="opacity-55">
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";

type Params = { params: Promise<{ guildId: string }> };

const features = [
  {
    key: "template-ai",
    name: "AI server builder",
    desc: "Preview, apply, or wipe and rebuild a full server template from Discord.",
    href: (id: string) => `/dashboard/${id}/template-ai`,
    live: true,
    status: "Live",
  },
  {
    key: "join-role",
    name: "Join role",
    desc: "Automatically give a role to every new member.",
    href: (id: string) => `/dashboard/${id}/join-role`,
    live: true,
    status: "Live",
  },
  {
    key: "reaction-roles",
    name: "Reaction roles",
    desc: "React to get a role.",
    href: (id: string) => `/dashboard/${id}/reaction-role`,
    live: true,
    status: "Live",
  },
  {
    key: "welcome",
    name: "Welcome",
    desc: "Post a welcome message when someone joins.",
    href: (id: string) => `/dashboard/${id}/welcome`,
    live: true,
    status: "Live",
  },
  {
    key: "tickets",
    name: "Tickets",
    desc: "Review open, claimed and closed support tickets from the bot.",
    href: (id: string) => `/dashboard/${id}/tickets`,
    live: true,
    status: "Live",
  },
  {
    key: "giveaways",
    name: "Giveaways",
    desc: "Track giveaway prizes, entrants, winner count and end times.",
    href: (id: string) => `/dashboard/${id}/giveaways`,
    live: true,
    status: "Live",
  },
  {
    key: "premium",
    name: "Premium",
    desc: "Check this server's plan and the Free vs Pro split.",
    href: (id: string) => `/dashboard/${id}/premium`,
    live: true,
    status: "Live",
  },
  {
    key: "forms",
    name: "Forms & applications",
    desc: "View forms and read member application responses.",
    href: (id: string) => `/dashboard/${id}/forms`,
    live: true,
    status: "Live",
  },
  {
    key: "analytics",
    name: "Analytics",
    desc: "See how your server is growing: joins, leaves and net change.",
    href: (id: string) => `/dashboard/${id}/analytics`,
    live: true,
    status: "Live",
  },
  {
    key: "leveling",
    name: "Leveling",
    desc: "XP and levels for chatting, with a leaderboard.",
    href: (id: string) => `/dashboard/${id}/leveling`,
    live: true,
    status: "Live",
  },
  {
    key: "starboard",
    name: "Starboard",
    desc: "Repost the most-starred messages to a best-of channel.",
    href: (id: string) => `/dashboard/${id}/starboard`,
    live: true,
    status: "Live",
  },
  {
    key: "suggestions",
    name: "Suggestions",
    desc: "Let members suggest ideas and vote on them.",
    href: (id: string) => `/dashboard/${id}/suggestions`,
    live: true,
    status: "Live",
  },
  {
    key: "tempvoice",
    name: "Temp voice",
    desc: "Members create their own voice channels by joining a hub.",
    href: (id: string) => `/dashboard/${id}/tempvoice`,
    live: true,
    status: "Live",
  },
  {
    key: "birthday",
    name: "Birthdays",
    desc: "Announce member birthdays on the day.",
    href: (id: string) => `/dashboard/${id}/birthday`,
    live: true,
    status: "Live",
  },
  {
    key: "autoresponders",
    name: "Autoresponders",
    desc: "Auto-reply when a message matches a trigger.",
    href: (id: string) => `/dashboard/${id}/autoresponders`,
    live: true,
    status: "Live",
  },
  {
    key: "invites",
    name: "Invites",
    desc: "See who has invited the most members.",
    href: (id: string) => `/dashboard/${id}/invites`,
    live: true,
    status: "Live",
  },
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
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                        f.live ? "text-acid" : "text-chalk/40"
                      }`}
                    >
                      {f.live ? f.status : "Soon"}
                    </span>
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

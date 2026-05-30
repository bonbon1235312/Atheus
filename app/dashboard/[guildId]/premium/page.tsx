import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getPremiumStatus } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

const freeItems = [
  "Core commands",
  "Join and reaction roles",
  "Welcome messages",
  "Tickets",
  "Giveaways and polls",
  "3 AI server builds",
];

const proItems = [
  "Unlimited AI server builds",
  "Saved AI templates",
  "Longer ticket transcript history",
  "Full analytics history",
  "Branding controls",
  "Priority support",
];

export default async function PremiumPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const premium = await getPremiumStatus(guildId);

  return (
    <main className="section-pad">
      <div className="container-studio">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          Back to {guild.name}
        </Link>
        <p className="kicker mt-6">Premium</p>
        <div className="mt-4 max-w-3xl">
          <h1 className="type-display text-5xl font-semibold leading-[0.98] md:text-6xl">
            {premium.active ? "This server is on Pro." : "This server is on Free."}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-chalk/68">
            Current status: <strong className="text-chalk">{premium.status}</strong>
            {premium.currentPeriodEnd
              ? ` until ${formatDate(premium.currentPeriodEnd)}`
              : ""}.
          </p>
        </div>

        <section className="mt-12 grid gap-px bg-white/12 lg:grid-cols-2">
          <Plan
            name="Free"
            price="GBP 0"
            active={!premium.active}
            items={freeItems}
            note="Enough to run a real server without paying first."
          />
          <Plan
            name="Pro"
            price="GBP 5/mo"
            active={premium.active}
            items={proItems}
            note="For servers that want the heavier automation and history."
          />
        </section>
      </div>
    </main>
  );
}

function Plan({
  name,
  price,
  active,
  items,
  note,
}: {
  name: string;
  price: string;
  active: boolean;
  items: string[];
  note: string;
}) {
  return (
    <article className={`bg-ink p-7 ${active ? "outline outline-1 outline-acid" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-chalk/45">
            {name}
          </p>
          <p className="type-display mt-3 text-4xl font-semibold">{price}</p>
        </div>
        {active && (
          <span className="border border-acid/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-acid">
            Active
          </span>
        )}
      </div>
      <p className="mt-4 text-chalk/58">{note}</p>
      <ul className="mt-7 grid gap-3 text-chalk/78">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-acid" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

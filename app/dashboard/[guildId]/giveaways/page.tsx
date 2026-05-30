import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildTextChannels } from "@/lib/discord";
import { getGiveaways, type GiveawayRow } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function GiveawaysPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const [giveaways, channels] = await Promise.all([
    getGiveaways(guildId),
    fetchGuildTextChannels(guildId),
  ]);
  const channelName = new Map(channels.map((channel) => [channel.id, channel.name] as const));
  const active = giveaways.filter((giveaway) => giveaway.status === "active");
  const ended = giveaways.filter((giveaway) => giveaway.status === "ended");

  return (
    <main className="section-pad">
      <div className="container-studio">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          Back to {guild.name}
        </Link>
        <p className="kicker mt-6">Giveaways</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.52fr] lg:items-end">
          <div>
            <h1 className="type-display text-5xl font-semibold leading-[0.98] md:text-6xl">
              Giveaway state without digging through chat.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-chalk/68">
              Every <code>/giveaway start</code> command writes here, including
              entrant counts, winner count, channel and end time.
            </p>
          </div>
          <div className="grid gap-px bg-white/12 sm:grid-cols-2 lg:grid-cols-1">
            <Metric label="Active" value={active.length} />
            <Metric label="Ended" value={ended.length} />
          </div>
        </div>

        <section className="mt-10 border-y border-white/15 py-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
            Discord commands
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["/giveaway start", "/giveaway list", "/giveaway end", "/giveaway reroll", "/poll create"].map(
              (command) => (
                <code key={command} className="border border-white/12 bg-ink px-3 py-2 text-sm">
                  {command}
                </code>
              )
            )}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
            Giveaway history
          </p>
          {giveaways.length === 0 ? (
            <p className="mt-4 text-chalk/55">
              No giveaways yet. Start one in Discord and it will be tracked here.
            </p>
          ) : (
            <div className="mt-4 grid gap-px bg-white/12">
              {giveaways.map((giveaway) => (
                <GiveawayCard
                  key={giveaway.id}
                  giveaway={giveaway}
                  channelName={channelName}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-ink p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-chalk/45">
        {label}
      </p>
      <p className="type-display mt-2 text-4xl font-semibold">{value}</p>
    </div>
  );
}

function GiveawayCard({
  giveaway,
  channelName,
}: {
  giveaway: GiveawayRow;
  channelName: Map<string, string>;
}) {
  const channel = channelName.get(giveaway.channel_id) ?? giveaway.channel_id;

  return (
    <article className="grid gap-5 bg-ink p-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className={statusClass(giveaway.status)}>{giveaway.status}</span>
          <span className="type-mono text-xs text-chalk/35">{giveaway.id}</span>
        </div>
        <h2 className="mt-4 text-2xl font-black">{giveaway.prize}</h2>
        <p className="mt-2 text-sm text-chalk/55">
          #{channel} · {giveaway.winner_count} winner
          {giveaway.winner_count === 1 ? "" : "s"}
        </p>
      </div>
      <dl className="grid gap-px bg-white/12 sm:grid-cols-3">
        <SmallStat label="Entrants" value={String(giveaway.entrants?.length ?? 0)} />
        <SmallStat label="Ends" value={formatDate(giveaway.ends_at)} />
        <SmallStat label="Message" value={giveaway.message_id ?? "pending"} />
      </dl>
    </article>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-ink p-4">
      <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-chalk/35">
        {label}
      </dt>
      <dd className="mt-2 truncate text-sm font-semibold text-chalk/75">{value}</dd>
    </div>
  );
}

function statusClass(status: GiveawayRow["status"]) {
  const base =
    "inline-flex items-center border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]";
  if (status === "ended") return `${base} border-white/12 text-chalk/45`;
  if (status === "cancelled") return `${base} border-flare/40 text-flare`;
  return `${base} border-signal/35 text-signal`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

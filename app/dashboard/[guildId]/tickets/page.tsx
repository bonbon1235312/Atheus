import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildTextChannels } from "@/lib/discord";
import { getTickets, type TicketRow } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

type TranscriptLine = {
  id?: string;
  author_id?: string;
  author_tag?: string;
  content?: string;
  created_at?: string;
};

export default async function TicketsPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const [tickets, channels] = await Promise.all([
    getTickets(guildId),
    fetchGuildTextChannels(guildId),
  ]);
  const channelName = new Map(channels.map((channel) => [channel.id, channel.name] as const));

  const openCount = tickets.filter((ticket) => ticket.status === "open").length;
  const claimedCount = tickets.filter((ticket) => ticket.status === "claimed").length;
  const closedCount = tickets.filter((ticket) => ticket.status === "closed").length;

  return (
    <main className="section-pad">
      <div className="container-studio">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          Back to {guild.name}
        </Link>
        <p className="kicker mt-6">Tickets</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div>
            <h1 className="type-display text-5xl font-semibold leading-[0.98] md:text-6xl">
              Support work, visible after the channel closes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-chalk/68">
              Tickets opened by the Discord panel are stored here with status,
              owner, claim data and the latest close transcript.
            </p>
          </div>
          <div className="grid gap-px bg-white/12 sm:grid-cols-3 lg:grid-cols-1">
            <Metric label="Open" value={openCount} />
            <Metric label="Claimed" value={claimedCount} />
            <Metric label="Closed" value={closedCount} />
          </div>
        </div>

        <section className="mt-10 border-y border-white/15 py-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
            Discord setup
          </p>
          <p className="mt-3 max-w-2xl text-chalk/62">
            Post the ticket panel with <code>/ticket setup</code>. Staff can use{" "}
            <code>/ticket claim</code>, <code>/ticket add</code>,{" "}
            <code>/ticket remove</code> and <code>/ticket close</code> inside a
            ticket channel.
          </p>
        </section>

        <section className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
            Recent tickets
          </p>
          {tickets.length === 0 ? (
            <p className="mt-4 text-chalk/55">
              No tickets yet. Once someone opens a ticket in Discord, it will
              appear here.
            </p>
          ) : (
            <div className="mt-4 grid gap-px bg-white/12">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} channelName={channelName} />
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

function TicketCard({
  ticket,
  channelName,
}: {
  ticket: TicketRow;
  channelName: Map<string, string>;
}) {
  const transcript = Array.isArray(ticket.transcript)
    ? (ticket.transcript as TranscriptLine[])
    : [];
  const preview = transcript.slice(-3);
  const channel = ticket.channel_id
    ? channelName.get(ticket.channel_id) ?? ticket.channel_id
    : "deleted channel";

  return (
    <article className="grid gap-5 bg-ink p-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className={statusClass(ticket.status)}>{ticket.status}</span>
          <span className="type-mono text-xs text-chalk/35">{ticket.id}</span>
        </div>
        <h2 className="mt-4 text-2xl font-black">
          Ticket by <span className="text-acid">{ticket.user_id}</span>
        </h2>
        <dl className="mt-4 grid gap-2 text-sm text-chalk/58">
          <Detail label="Channel" value={channel} />
          <Detail label="Claimed by" value={ticket.claimed_by ?? "Unclaimed"} />
          <Detail label="Closed by" value={ticket.closed_by ?? "Not closed"} />
          <Detail label="Created" value={formatDate(ticket.created_at)} />
        </dl>
      </div>

      <div className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-chalk/45">
          Transcript
        </p>
        {transcript.length === 0 ? (
          <p className="mt-3 text-sm text-chalk/50">
            Transcript appears after <code>/ticket close</code>.
          </p>
        ) : (
          <div className="mt-3 grid gap-3">
            {preview.map((line, index) => (
              <div key={line.id ?? index} className="border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs font-semibold text-chalk/45">
                  {line.author_tag ?? line.author_id ?? "Unknown"} ·{" "}
                  {line.created_at ? formatDate(line.created_at) : "unknown time"}
                </p>
                <p className="mt-1 break-words text-sm text-chalk/78">
                  {line.content || "[no text content]"}
                </p>
              </div>
            ))}
            <p className="text-xs text-chalk/40">
              Showing last {preview.length} of {transcript.length} saved messages.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3">
      <dt className="font-black uppercase tracking-[0.16em] text-chalk/35">{label}</dt>
      <dd className="min-w-0 break-all text-chalk/72">{value}</dd>
    </div>
  );
}

function statusClass(status: TicketRow["status"]) {
  const base =
    "inline-flex items-center border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]";
  if (status === "closed") return `${base} border-white/12 text-chalk/45`;
  if (status === "claimed") return `${base} border-acid/40 text-acid`;
  return `${base} border-signal/35 text-signal`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

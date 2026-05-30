import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getTemplateAiSnapshot } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function TemplateAiPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const { snapshot } = await getTemplateAiSnapshot(guildId);
  const roles = snapshot?.roles ?? [];
  const channels = snapshot?.channels ?? [];
  const categories = channels.filter((channel) => channel.type === 4);

  return (
    <main className="section-pad">
      <div className="container-studio">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          Back to {guild.name}
        </Link>
        <p className="kicker mt-6">AI server builder</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div>
            <h1 className="type-display text-5xl font-semibold leading-[0.98] md:text-6xl">
              Build from Discord. Audit it here.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-chalk/68">
              <code>/template ai</code> opens the builder panel in Discord.
              Apply creates roles, categories, channels, rules and welcome config.
              Wipe snapshots the old server first, then rebuilds.
            </p>
          </div>
          <div className="grid gap-px bg-white/12 sm:grid-cols-3 lg:grid-cols-1">
            <Metric label="Saved roles" value={roles.length} />
            <Metric label="Saved categories" value={categories.length} />
            <Metric label="Saved channels" value={channels.length} />
          </div>
        </div>

        <section className="mt-10 grid gap-px bg-white/12 lg:grid-cols-3">
          <Panel title="1. Prompt">
            Pick <code>/template ai</code>, describe the server, choose a style,
            and let Groq return the JSON structure.
          </Panel>
          <Panel title="2. Validate">
            atheus repairs and checks the plan before any Discord object is
            touched. Weak templates are rejected.
          </Panel>
          <Panel title="3. Apply">
            Use Apply to add to the server, or Wipe and Apply when you want a
            clean rebuild after confirmation.
          </Panel>
        </section>

        <section className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
            Last wipe snapshot
          </p>
          {!snapshot ? (
            <p className="mt-4 max-w-2xl text-chalk/55">
              No wipe snapshot yet. A snapshot is saved only when someone uses
              the destructive Wipe and Apply flow.
            </p>
          ) : (
            <div className="mt-4 grid gap-px bg-white/12 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="bg-ink p-5">
                <p className="text-sm text-chalk/50">Created</p>
                <p className="mt-2 text-xl font-black">
                  {snapshot.createdAt ? formatDate(snapshot.createdAt) : "Unknown"}
                </p>
                <p className="mt-5 text-sm text-chalk/50">Created by</p>
                <p className="mt-2 type-mono break-all text-sm text-chalk/75">
                  {snapshot.createdBy ?? "Unknown"}
                </p>
              </div>
              <div className="grid gap-px bg-white/12 md:grid-cols-2">
                <SnapshotList title="Roles" items={roles.map((role) => role.name)} />
                <SnapshotList title="Channels" items={channels.map((channel) => channel.name)} />
              </div>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="bg-ink p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-3 text-sm text-chalk/62">{children}</p>
    </article>
  );
}

function SnapshotList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-w-0 bg-ink p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-chalk/45">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-chalk/45">None saved.</p>
      ) : (
        <ul className="mt-3 grid max-h-72 gap-2 overflow-auto pr-2 text-sm text-chalk/72">
          {items.slice(0, 40).map((item, index) => (
            <li key={`${item}-${index}`} className="truncate">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

import Link from "next/link";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getFormSummaries, getRecentFormResponses } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function FormsPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const [forms, responses] = await Promise.all([
    getFormSummaries(guildId),
    getRecentFormResponses(guildId, 15),
  ]);

  return (
    <main className="section-pad">
      <div className="container-studio max-w-3xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          ← {guild.name}
        </Link>
        <p className="kicker mt-6">Forms &amp; applications</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
          Applications.
        </h1>
        <p className="mt-5 text-chalk/64">
          Create and post forms in Discord with <code>/form</code>. Responses land here
          and in your chosen channel.
        </p>

        {/* Forms */}
        <h2 className="type-display mt-12 text-2xl font-semibold tracking-tight">Your forms</h2>
        {forms.length === 0 ? (
          <p className="mt-4 text-chalk/55">
            No forms yet. Run <code>/form create</code> in your server to make one.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3">
            {forms.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-white/12 bg-graphite p-4"
              >
                <span className="font-semibold">{f.name}</span>
                <span className="text-sm text-chalk/55">
                  {f.questions} question{f.questions === 1 ? "" : "s"} · {f.responses} response
                  {f.responses === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Recent responses */}
        <h2 className="type-display mt-12 text-2xl font-semibold tracking-tight">Recent responses</h2>
        {responses.length === 0 ? (
          <p className="mt-4 text-chalk/55">No responses yet.</p>
        ) : (
          <ul className="mt-5 grid gap-3">
            {responses.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/12 bg-graphite p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">{r.formName}</span>
                  <span className="type-mono text-xs text-chalk/45">
                    {new Date(r.submittedAt).toLocaleString("en-GB")} · {r.userId}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2">
                  {Object.values(r.answers).map((a, i) => (
                    <div key={i}>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-blurpleHi">
                        {a.label}
                      </dt>
                      <dd className="mt-0.5 text-chalk/80">{a.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

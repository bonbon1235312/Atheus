import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getAutoresponders, addAutoresponderWeb, removeAutoresponderWeb } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function AutorespondersPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const items = await getAutoresponders(guildId);

  async function add(formData: FormData) {
    "use server";
    const trigger = String(formData.get("trigger") ?? "").trim();
    const response = String(formData.get("response") ?? "").trim();
    const match = String(formData.get("match") ?? "contains");
    if (trigger && response) await addAutoresponderWeb(guildId, trigger, response, match);
    revalidatePath(`/dashboard/${guildId}/autoresponders`);
  }

  async function remove(formData: FormData) {
    "use server";
    await removeAutoresponderWeb(guildId, String(formData.get("id")));
    revalidatePath(`/dashboard/${guildId}/autoresponders`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Autoresponders</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Auto-replies.</h1>
        <p className="mt-5 text-chalk/64">
          When a message matches a trigger, atheus replies. (Needs the Message Content intent enabled to work.)
        </p>

        <form action={add} className="mt-10 grid gap-4 rounded-2xl border border-white/12 bg-graphite p-6">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blurpleHi">Trigger</span>
            <input name="trigger" required maxLength={100} className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-blurpleHi focus:outline-none" placeholder="e.g. how do i apply" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-chalk/55">Response</span>
            <textarea name="response" required maxLength={1500} rows={3} className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-blurpleHi focus:outline-none" placeholder="Run /apply staff to apply!" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-chalk/55">Match</span>
            <select name="match" defaultValue="contains" className="w-44 border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-blurpleHi focus:outline-none">
              <option value="contains">contains</option>
              <option value="exact">exact</option>
            </select>
          </label>
          <button type="submit" className="studio-button studio-button-primary justify-self-start">Add</button>
        </form>

        <ul className="mt-6 grid gap-3">
          {items.length === 0 ? (
            <p className="text-chalk/55">No autoresponders yet.</p>
          ) : (
            items.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/12 bg-graphite p-4">
                <div className="min-w-0">
                  <p className="font-semibold">&quot;{a.trigger}&quot; <span className="text-xs text-chalk/45">({a.match_type})</span></p>
                  <p className="mt-1 truncate text-sm text-chalk/60">{a.response}</p>
                </div>
                <form action={remove}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="studio-button studio-button-secondary shrink-0">Remove</button>
                </form>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}

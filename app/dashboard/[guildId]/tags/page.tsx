import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getTagsWeb, setTagWeb, deleteTagWeb } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function TagsPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const tags = await getTagsWeb(guildId);

  async function add(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim().toLowerCase();
    const content = String(formData.get("content") ?? "").trim();
    if (name && content) await setTagWeb(guildId, name, content);
    revalidatePath(`/dashboard/${guildId}/tags`);
  }

  async function remove(formData: FormData) {
    "use server";
    await deleteTagWeb(guildId, String(formData.get("name")));
    revalidatePath(`/dashboard/${guildId}/tags`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Tags</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Saved answers.</h1>
        <p className="mt-5 text-chalk/64">Members recall these with <code>/tag get</code>.</p>

        <form action={add} className="mt-10 grid gap-4 rounded-2xl border border-white/12 bg-graphite p-6">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blurpleHi">Name</span>
            <input name="name" required maxLength={60} className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-blurpleHi focus:outline-none" placeholder="rules" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-chalk/55">Content</span>
            <textarea name="content" required maxLength={1800} rows={3} className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-blurpleHi focus:outline-none" />
          </label>
          <button type="submit" className="studio-button studio-button-primary justify-self-start">Save tag</button>
        </form>

        <ul className="mt-6 grid gap-3">
          {tags.length === 0 ? (
            <p className="text-chalk/55">No tags yet.</p>
          ) : (
            tags.map((t) => (
              <li key={t.name} className="flex items-start justify-between gap-4 rounded-xl border border-white/12 bg-graphite p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-1 truncate text-sm text-chalk/60">{t.content}</p>
                </div>
                <form action={remove}>
                  <input type="hidden" name="name" value={t.name} />
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

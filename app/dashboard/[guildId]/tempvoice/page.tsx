import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildVoiceChannels, fetchGuildCategories } from "@/lib/discord";
import { getFeatureConfigRow, setFeatureConfigRow, disableFeatureConfigRow } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function TempVoicePage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const [voice, categories, cfg] = await Promise.all([
    fetchGuildVoiceChannels(guildId),
    fetchGuildCategories(guildId),
    getFeatureConfigRow(guildId, "tempvoice"),
  ]);
  const hubId = (cfg.config.hubChannelId as string) ?? "";
  const categoryId = (cfg.config.categoryId as string) ?? "";

  async function save(formData: FormData) {
    "use server";
    const hub = String(formData.get("hub") ?? "");
    const category = String(formData.get("category") ?? "");
    if (!hub) await disableFeatureConfigRow(guildId, "tempvoice");
    else await setFeatureConfigRow(guildId, "tempvoice", { hubChannelId: hub, categoryId: category || null }, true);
    revalidatePath(`/dashboard/${guildId}/tempvoice`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Temp voice</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Join to create.</h1>
        <p className="mt-5 text-chalk/64">
          Members who join the hub get their own voice channel they control with <code>/voice</code>.
        </p>

        <form action={save} className="mt-10 grid gap-5">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blurpleHi">Hub voice channel</span>
            <select name="hub" defaultValue={hubId} className="border border-white/15 bg-ink px-4 py-3 text-lg text-chalk focus:border-blurpleHi focus:outline-none">
              <option value="">— Off —</option>
              {voice.map((c) => (
                <option key={c.id} value={c.id}>🔊 {c.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-chalk/55">Category for new channels (optional)</span>
            <select name="category" defaultValue={categoryId} className="border border-white/15 bg-ink px-4 py-3 text-lg text-chalk focus:border-blurpleHi focus:outline-none">
              <option value="">— Same as the hub —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="studio-button studio-button-primary justify-self-start">Save</button>
        </form>
      </div>
    </main>
  );
}

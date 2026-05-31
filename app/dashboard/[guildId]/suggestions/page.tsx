import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildTextChannels } from "@/lib/discord";
import { getFeatureConfigRow, setFeatureConfigRow, disableFeatureConfigRow } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function SuggestionsPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const channels = await fetchGuildTextChannels(guildId);
  const cfg = await getFeatureConfigRow(guildId, "suggestions");
  const channelId = (cfg.config.channelId as string) ?? "";

  async function save(formData: FormData) {
    "use server";
    const ch = String(formData.get("channelId") ?? "");
    if (!ch) await disableFeatureConfigRow(guildId, "suggestions");
    else await setFeatureConfigRow(guildId, "suggestions", { channelId: ch }, true);
    revalidatePath(`/dashboard/${guildId}/suggestions`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Suggestions</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Let members suggest ideas.</h1>
        <p className="mt-5 text-chalk/64">
          Members use <code>/suggest</code>; ideas post here with vote and approve/deny buttons.
        </p>

        <form action={save} className="mt-10 grid gap-5">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blurpleHi">Suggestions channel</span>
            <select name="channelId" defaultValue={channelId} className="border border-white/15 bg-ink px-4 py-3 text-lg text-chalk focus:border-blurpleHi focus:outline-none">
              <option value="">— Off —</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}># {c.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="studio-button studio-button-primary justify-self-start">Save</button>
        </form>
      </div>
    </main>
  );
}

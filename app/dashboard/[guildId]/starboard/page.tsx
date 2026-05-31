import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildTextChannels } from "@/lib/discord";
import { getFeatureConfigRow, setFeatureConfigRow, disableFeatureConfigRow } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function StarboardPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const channels = await fetchGuildTextChannels(guildId);
  const cfg = await getFeatureConfigRow(guildId, "starboard");
  const channelId = (cfg.config.channelId as string) ?? "";
  const threshold = (cfg.config.threshold as number) ?? 3;

  async function save(formData: FormData) {
    "use server";
    const ch = String(formData.get("channelId") ?? "");
    const th = Math.max(1, Number(formData.get("threshold") ?? 3));
    if (!ch) await disableFeatureConfigRow(guildId, "starboard");
    else await setFeatureConfigRow(guildId, "starboard", { channelId: ch, threshold: th }, true);
    revalidatePath(`/dashboard/${guildId}/starboard`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Starboard</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Best-of channel.</h1>
        <p className="mt-5 text-chalk/64">
          When a message gets enough ⭐ reactions, atheus reposts it to your starboard channel.
        </p>

        <form action={save} className="mt-10 grid gap-5">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blurpleHi">Starboard channel</span>
            <select name="channelId" defaultValue={channelId} className="border border-white/15 bg-ink px-4 py-3 text-lg text-chalk focus:border-blurpleHi focus:outline-none">
              <option value="">— Off —</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}># {c.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-chalk/55">Stars needed</span>
            <input type="number" name="threshold" min={1} max={50} defaultValue={threshold} className="w-32 border border-white/15 bg-ink px-4 py-3 text-lg text-chalk focus:border-blurpleHi focus:outline-none" />
          </label>
          <button type="submit" className="studio-button studio-button-primary justify-self-start">Save</button>
        </form>

        <p className="mt-8 text-sm text-chalk/45">
          {channelId ? `Active in <#${channelId}> at ${threshold} ⭐.` : "Currently off."} Same as the `/starboard` command.
        </p>
      </div>
    </main>
  );
}

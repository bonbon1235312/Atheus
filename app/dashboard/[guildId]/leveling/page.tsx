import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildTextChannels } from "@/lib/discord";
import {
  getFeatureConfigRow,
  setFeatureConfigRow,
  disableFeatureConfigRow,
  getLevelLeaderboard,
} from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function LevelingPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const [channels, cfg, leaders] = await Promise.all([
    fetchGuildTextChannels(guildId),
    getFeatureConfigRow(guildId, "leveling"),
    getLevelLeaderboard(guildId, 10),
  ]);
  const announceChannelId = (cfg.config.announceChannelId as string) ?? "";

  async function save(formData: FormData) {
    "use server";
    const enabled = formData.get("enabled") === "on";
    const announce = String(formData.get("announce") ?? "");
    if (!enabled) await disableFeatureConfigRow(guildId, "leveling");
    else await setFeatureConfigRow(guildId, "leveling", { announceChannelId: announce || null }, true);
    revalidatePath(`/dashboard/${guildId}/leveling`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Leveling</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">XP &amp; levels.</h1>
        <p className="mt-5 text-chalk/64">Members earn XP for chatting. They check progress with <code>/rank</code>.</p>

        <form action={save} className="mt-10 grid gap-5">
          <label className="flex items-center gap-3">
            <input type="checkbox" name="enabled" defaultChecked={cfg.enabled} className="h-5 w-5 accent-[#5865f2]" />
            <span className="text-chalk/85">Leveling enabled</span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-chalk/55">Level-up channel (optional)</span>
            <select name="announce" defaultValue={announceChannelId} className="border border-white/15 bg-ink px-4 py-3 text-lg text-chalk focus:border-blurpleHi focus:outline-none">
              <option value="">— Where they chatted —</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}># {c.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="studio-button studio-button-primary justify-self-start">Save</button>
        </form>

        <h2 className="type-display mt-12 text-2xl font-semibold tracking-tight">Top members</h2>
        {leaders.length === 0 ? (
          <p className="mt-4 text-chalk/55">No XP yet.</p>
        ) : (
          <ol className="mt-5 grid gap-2">
            {leaders.map((l, i) => (
              <li key={l.user_id} className="flex items-center justify-between rounded-xl border border-white/12 bg-graphite px-4 py-3">
                <span className="text-chalk/85">#{i + 1} · {l.user_id}</span>
                <span className="type-mono text-sm text-blurpleHi">{l.xp.toLocaleString()} XP</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

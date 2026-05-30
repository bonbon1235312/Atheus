import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildTextChannels } from "@/lib/discord";
import {
  disableWelcomeConfig,
  getWelcomeConfig,
  setWelcomeConfig,
} from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function WelcomePage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const channels = await fetchGuildTextChannels(guildId);
  const welcome = await getWelcomeConfig(guildId);

  async function save(formData: FormData) {
    "use server";
    const channelId = String(formData.get("channelId") ?? "");
    const message = String(formData.get("message") ?? "");
    if (channelId && message) {
      await setWelcomeConfig(guildId, { channelId, message });
    }
    revalidatePath(`/dashboard/${guildId}/welcome`);
  }

  async function turnOff() {
    "use server";
    await disableWelcomeConfig(guildId);
    revalidatePath(`/dashboard/${guildId}/welcome`);
  }

  const defaultMessage =
    welcome.config.message ?? "Welcome {mention} to {server}. Glad you're here.";

  return (
    <main className="section-pad">
      <div className="container-studio max-w-3xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          Back to {guild.name}
        </Link>
        <p className="kicker mt-6">Welcome</p>
        <h1 className="type-display mt-4 text-5xl font-semibold leading-[0.98] md:text-6xl">
          Greet new members cleanly.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-chalk/68">
          Choose the channel and message atheus posts when someone joins.
          Placeholders: <code>{"{mention}"}</code>, <code>{"{user}"}</code>,{" "}
          <code>{"{server}"}</code>.
        </p>

        <form action={save} className="mt-10 grid gap-5 border-y border-white/15 py-6">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-chalk/55">
              Channel
            </span>
            <select
              name="channelId"
              defaultValue={welcome.config.channelId ?? ""}
              required
              className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-acid focus:outline-none"
            >
              <option value="" disabled>
                Choose a channel
              </option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  #{channel.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-chalk/55">
              Message
            </span>
            <textarea
              name="message"
              defaultValue={defaultMessage}
              maxLength={1000}
              required
              rows={4}
              className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-acid focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="studio-button studio-button-primary">
              Save welcome
            </button>
            <button formAction={turnOff} className="studio-button studio-button-secondary">
              Turn off
            </button>
          </div>
        </form>

        <section className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
            Current state
          </p>
          <div className="mt-4 border border-white/15 bg-ink p-5">
            <p className="font-semibold">
              {welcome.enabled ? "Welcome messages are on." : "Welcome messages are off."}
            </p>
            {welcome.enabled && welcome.config.channelId && (
              <p className="mt-2 text-chalk/60">
                Posting in <span className="text-chalk">#{channels.find((c) => c.id === welcome.config.channelId)?.name ?? welcome.config.channelId}</span>
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

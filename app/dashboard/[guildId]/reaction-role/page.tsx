import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { addBotReaction, assignableRoles, fetchGuildRoles } from "@/lib/discord";
import {
  addReactionRole,
  getReactionRoles,
  removeReactionRole,
} from "@/lib/guild-config";
import { emojiInputToKey } from "@/lib/emoji";
import { parseDiscordMessageLink } from "@/lib/message-links";

type Params = { params: Promise<{ guildId: string }> };

export default async function ReactionRolePage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const roles = assignableRoles(await fetchGuildRoles(guildId));
  const rules = await getReactionRoles(guildId);
  const nameOf = new Map(roles.map((role) => [role.id, role.name] as const));

  async function add(formData: FormData) {
    "use server";
    const messageLink = String(formData.get("messageLink") ?? "");
    const emojiInput = String(formData.get("emoji") ?? "");
    const roleId = String(formData.get("roleId") ?? "");
    const parsed = parseDiscordMessageLink(messageLink);

    if (!parsed || parsed.guildId !== guildId || !emojiInput || !roleId) return;

    const emoji = emojiInputToKey(emojiInput);
    await addBotReaction(parsed.channelId, parsed.messageId, emoji);
    await addReactionRole({
      guildId,
      channelId: parsed.channelId,
      messageId: parsed.messageId,
      emoji,
      roleId,
    });
    revalidatePath(`/dashboard/${guildId}/reaction-role`);
  }

  async function remove(formData: FormData) {
    "use server";
    const messageId = String(formData.get("messageId") ?? "");
    const emoji = String(formData.get("emoji") ?? "");
    if (messageId && emoji) {
      await removeReactionRole({ guildId, messageId, emoji });
    }
    revalidatePath(`/dashboard/${guildId}/reaction-role`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-3xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          Back to {guild.name}
        </Link>
        <p className="kicker mt-6">Reaction roles</p>
        <h1 className="type-display mt-4 text-5xl font-semibold leading-[0.98] md:text-6xl">
          Let members pick their own roles.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-chalk/68">
          Paste a Discord message link, choose an emoji, and pick the role atheus
          should give when members react.
        </p>

        <form action={add} className="mt-10 grid gap-5 border-y border-white/15 py-6">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-chalk/55">
              Message link
            </span>
            <input
              name="messageLink"
              placeholder="https://discord.com/channels/..."
              required
              className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-acid focus:outline-none"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-[0.45fr_1fr_auto] sm:items-end">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-chalk/55">
                Emoji
              </span>
              <input
                name="emoji"
                placeholder="✅"
                required
                className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-acid focus:outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-chalk/55">
                Role
              </span>
              <select
                name="roleId"
                defaultValue=""
                required
                className="border border-white/15 bg-ink px-4 py-3 text-chalk focus:border-acid focus:outline-none"
              >
                <option value="" disabled>
                  Choose a role
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="studio-button studio-button-primary">
              Add rule
            </button>
          </div>
        </form>

        <section className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
            Active reaction roles
          </p>
          {rules.length === 0 ? (
            <p className="mt-4 text-chalk/55">No reaction roles yet.</p>
          ) : (
            <ul className="mt-4 grid gap-px bg-white/12">
              {rules.map((rule) => (
                <li
                  key={rule.id}
                  className="grid gap-4 bg-ink p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">
                      <span className="text-acid">{rule.emoji}</span>{" "}
                      gives {nameOf.get(rule.role_id) ?? `Role ${rule.role_id}`}
                    </p>
                    <p className="mt-1 break-all text-sm text-chalk/45">
                      Channel {rule.channel_id}, message {rule.message_id}
                    </p>
                  </div>
                  <form action={remove}>
                    <input type="hidden" name="messageId" value={rule.message_id} />
                    <input type="hidden" name="emoji" value={rule.emoji} />
                    <button type="submit" className="studio-button studio-button-secondary">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

import { supabaseAdmin } from "@/lib/supabase-admin";

// Dashboard-side reads/writes against the SAME tables the bot uses.
// Mirrors atheus-bot/src/db semantics (column `kind`, multiple join roles per guild).

/** Guild IDs the bot is currently in (bot upserts on join, sets bot_left_at on leave). */
export async function botGuildIds(): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin()
    .from("guilds")
    .select("guild_id")
    .is("bot_left_at", null);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.guild_id as string));
}

/** All of the server's join roles (a server can have several). */
export async function getJoinRoles(guildId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin()
    .from("auto_roles")
    .select("role_id")
    .eq("guild_id", guildId)
    .eq("kind", "join");
  if (error) throw error;
  return (data ?? []).map((r) => r.role_id as string);
}

/** Add a join role (idempotent — dedupes the same role). Mirrors the bot's addJoinRole. */
export async function addJoinRole(guildId: string, roleId: string): Promise<void> {
  const sb = supabaseAdmin();

  const del = await sb
    .from("auto_roles")
    .delete()
    .match({ guild_id: guildId, kind: "join", role_id: roleId });
  if (del.error) throw del.error;

  const ins = await sb
    .from("auto_roles")
    .insert({ guild_id: guildId, kind: "join", role_id: roleId });
  if (ins.error) throw ins.error;
}

/** Remove a single join role. */
export async function removeJoinRole(guildId: string, roleId: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("auto_roles")
    .delete()
    .match({ guild_id: guildId, kind: "join", role_id: roleId });
  if (error) throw error;
}

export type ReactionRoleRule = {
  id: string;
  channel_id: string;
  message_id: string;
  emoji: string;
  role_id: string;
};

export async function getReactionRoles(guildId: string): Promise<ReactionRoleRule[]> {
  const { data, error } = await supabaseAdmin()
    .from("auto_roles")
    .select("id, channel_id, message_id, emoji, role_id")
    .eq("guild_id", guildId)
    .eq("kind", "reaction")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReactionRoleRule[];
}

export async function addReactionRole({
  guildId,
  channelId,
  messageId,
  emoji,
  roleId,
}: {
  guildId: string;
  channelId: string;
  messageId: string;
  emoji: string;
  roleId: string;
}): Promise<void> {
  const sb = supabaseAdmin();

  const del = await sb
    .from("auto_roles")
    .delete()
    .match({ guild_id: guildId, kind: "reaction", message_id: messageId, emoji });
  if (del.error) throw del.error;

  const ins = await sb.from("auto_roles").insert({
    guild_id: guildId,
    kind: "reaction",
    channel_id: channelId,
    message_id: messageId,
    emoji,
    role_id: roleId,
  });
  if (ins.error) throw ins.error;
}

export async function removeReactionRole({
  guildId,
  messageId,
  emoji,
}: {
  guildId: string;
  messageId: string;
  emoji: string;
}): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("auto_roles")
    .delete()
    .match({ guild_id: guildId, kind: "reaction", message_id: messageId, emoji });
  if (error) throw error;
}

export type WelcomeConfig = {
  channelId?: string;
  message?: string;
};

export async function getWelcomeConfig(
  guildId: string
): Promise<{ enabled: boolean; config: WelcomeConfig }> {
  const { data, error } = await supabaseAdmin()
    .from("feature_config")
    .select("config, enabled")
    .eq("guild_id", guildId)
    .eq("feature_key", "welcome")
    .maybeSingle();
  if (error) throw error;
  return {
    enabled: Boolean(data?.enabled),
    config: (data?.config ?? {}) as WelcomeConfig,
  };
}

export async function setWelcomeConfig(
  guildId: string,
  config: Required<WelcomeConfig>
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("feature_config")
    .upsert(
      {
        guild_id: guildId,
        feature_key: "welcome",
        config,
        enabled: true,
      },
      { onConflict: "guild_id,feature_key" }
    );
  if (error) throw error;
}

export async function disableWelcomeConfig(guildId: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("feature_config")
    .upsert(
      {
        guild_id: guildId,
        feature_key: "welcome",
        config: {},
        enabled: false,
      },
      { onConflict: "guild_id,feature_key" }
    );
  if (error) throw error;
}

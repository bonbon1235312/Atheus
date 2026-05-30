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

export type TicketRow = {
  id: string;
  guild_id: string;
  channel_id: string | null;
  user_id: string;
  status: "open" | "claimed" | "closed";
  claimed_by: string | null;
  closed_by: string | null;
  transcript: unknown[];
  created_at: string;
  closed_at: string | null;
  updated_at: string;
};

export async function getTickets(guildId: string): Promise<TicketRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("tickets")
    .select(
      "id, guild_id, channel_id, user_id, status, claimed_by, closed_by, transcript, created_at, closed_at, updated_at"
    )
    .eq("guild_id", guildId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as TicketRow[];
}

export type GiveawayRow = {
  id: string;
  guild_id: string;
  channel_id: string;
  message_id: string | null;
  prize: string;
  winner_count: number;
  entrants: string[];
  ends_at: string;
  status: "active" | "ended" | "cancelled";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function getGiveaways(guildId: string): Promise<GiveawayRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("giveaways")
    .select(
      "id, guild_id, channel_id, message_id, prize, winner_count, entrants, ends_at, status, created_by, created_at, updated_at"
    )
    .eq("guild_id", guildId)
    .order("ends_at", { ascending: true })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as GiveawayRow[];
}

export type PremiumStatus = {
  status: string;
  active: boolean;
  currentPeriodEnd: string | null;
};

export async function getPremiumStatus(guildId: string): Promise<PremiumStatus> {
  const sb = supabaseAdmin();
  const premium = await sb
    .from("premium")
    .select("status, current_period_end")
    .eq("guild_id", guildId)
    .maybeSingle();
  if (premium.error) throw premium.error;

  if (premium.data) {
    const status = String(premium.data.status ?? "free");
    const periodEnd = premium.data.current_period_end as string | null;
    const inPeriod = !periodEnd || new Date(periodEnd).getTime() > Date.now();
    return {
      status,
      active: ["active", "trialing"].includes(status) && inPeriod,
      currentPeriodEnd: periodEnd,
    };
  }

  const guild = await sb
    .from("guilds")
    .select("premium")
    .eq("guild_id", guildId)
    .maybeSingle();
  if (guild.error) throw guild.error;

  return {
    status: guild.data?.premium ? "active" : "free",
    active: Boolean(guild.data?.premium),
    currentPeriodEnd: null,
  };
}

export type TemplateAiSnapshot = {
  createdAt?: string;
  createdBy?: string;
  guildId?: string;
  roles?: Array<{
    id: string;
    name: string;
    color?: string;
    position?: number;
    managed?: boolean;
  }>;
  channels?: Array<{
    id: string;
    name: string;
    type: number;
    parentId?: string | null;
    position?: number;
    topic?: string | null;
  }>;
};

export async function getTemplateAiSnapshot(
  guildId: string
): Promise<{ enabled: boolean; snapshot: TemplateAiSnapshot | null }> {
  const { data, error } = await supabaseAdmin()
    .from("feature_config")
    .select("config, enabled")
    .eq("guild_id", guildId)
    .eq("feature_key", "template_ai_last_snapshot")
    .maybeSingle();
  if (error) throw error;

  return {
    enabled: Boolean(data?.enabled),
    snapshot: data?.config ? (data.config as TemplateAiSnapshot) : null,
  };
}

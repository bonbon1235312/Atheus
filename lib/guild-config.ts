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

function activeFrom(status: string, periodEnd: string | null): boolean {
  const inPeriod = !periodEnd || new Date(periodEnd).getTime() > Date.now();
  return ["active", "trialing"].includes(status) && inPeriod;
}

/** All-access (account-level) premium for a Discord user. */
export async function getAccountPremium(userId: string): Promise<PremiumStatus> {
  const { data, error } = await supabaseAdmin()
    .from("account_premium")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  const status = String(data?.status ?? "free");
  const periodEnd = (data?.current_period_end as string | null) ?? null;
  return { status, active: data ? activeFrom(status, periodEnd) : false, currentPeriodEnd: periodEnd };
}

/** Set of guild IDs with an active per-server subscription. */
export async function getActivePremiumGuildIds(): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin()
    .from("premium")
    .select("guild_id, status, current_period_end");
  if (error) throw error;
  const now = Date.now();
  const set = new Set<string>();
  for (const r of data ?? []) {
    const inPeriod =
      !r.current_period_end || new Date(r.current_period_end as string).getTime() > now;
    if (["active", "trialing"].includes(String(r.status)) && inPeriod) {
      set.add(r.guild_id as string);
    }
  }
  return set;
}

export async function getPremiumStatus(guildId: string): Promise<PremiumStatus> {
  const sb = supabaseAdmin();

  // 1. Per-server subscription.
  const premium = await sb
    .from("premium")
    .select("status, current_period_end")
    .eq("guild_id", guildId)
    .maybeSingle();
  if (premium.error) throw premium.error;
  if (premium.data) {
    const status = String(premium.data.status ?? "free");
    const periodEnd = premium.data.current_period_end as string | null;
    if (activeFrom(status, periodEnd)) return { status, active: true, currentPeriodEnd: periodEnd };
  }

  // 2. The owner's all-access subscription.
  const guild = await sb
    .from("guilds")
    .select("owner_id, premium")
    .eq("guild_id", guildId)
    .maybeSingle();
  if (guild.error) throw guild.error;

  const ownerId = guild.data?.owner_id as string | undefined;
  if (ownerId) {
    const acct = await getAccountPremium(ownerId);
    if (acct.active) {
      return { status: "active (all-access)", active: true, currentPeriodEnd: acct.currentPeriodEnd };
    }
  }

  // 3. Inactive per-server row, manual override, or free.
  if (premium.data) {
    return {
      status: String(premium.data.status ?? "free"),
      active: false,
      currentPeriodEnd: premium.data.current_period_end as string | null,
    };
  }
  return {
    status: guild.data?.premium ? "active" : "free",
    active: Boolean(guild.data?.premium),
    currentPeriodEnd: null,
  };
}

// --- Generic feature config (mirrors the bot's featureConfig.js) -----------

export type FeatureConfigRow = { config: Record<string, unknown>; enabled: boolean };

export async function getFeatureConfigRow(guildId: string, featureKey: string): Promise<FeatureConfigRow> {
  const { data, error } = await supabaseAdmin()
    .from("feature_config")
    .select("config, enabled")
    .eq("guild_id", guildId)
    .eq("feature_key", featureKey)
    .maybeSingle();
  if (error) throw error;
  return { config: (data?.config ?? {}) as Record<string, unknown>, enabled: Boolean(data?.enabled) };
}

export async function setFeatureConfigRow(
  guildId: string,
  featureKey: string,
  config: Record<string, unknown>,
  enabled = true
) {
  const { error } = await supabaseAdmin()
    .from("feature_config")
    .upsert({ guild_id: guildId, feature_key: featureKey, config, enabled }, { onConflict: "guild_id,feature_key" });
  if (error) throw error;
}

export async function disableFeatureConfigRow(guildId: string, featureKey: string) {
  await setFeatureConfigRow(guildId, featureKey, {}, false);
}

// --- Leveling / invites / autoresponders (dashboard) ----------------------

export async function getLevelLeaderboard(guildId: string, limit = 10): Promise<{ user_id: string; xp: number }[]> {
  const { data, error } = await supabaseAdmin()
    .from("levels")
    .select("user_id, xp")
    .eq("guild_id", guildId)
    .order("xp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as { user_id: string; xp: number }[];
}

export async function getInviteLeaderboardWeb(guildId: string, limit = 10): Promise<{ inviterId: string; count: number }[]> {
  const { data, error } = await supabaseAdmin()
    .from("invite_uses")
    .select("inviter_id")
    .eq("guild_id", guildId)
    .not("inviter_id", "is", null);
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const r of data ?? []) {
    const id = (r as { inviter_id: string }).inviter_id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([inviterId, count]) => ({ inviterId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export type AutoresponderRow = { id: string; trigger: string; response: string; match_type: string };

export async function getAutoresponders(guildId: string): Promise<AutoresponderRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("autoresponders")
    .select("id, trigger, response, match_type")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AutoresponderRow[];
}

export async function addAutoresponderWeb(guildId: string, trigger: string, response: string, matchType: string) {
  const { error } = await supabaseAdmin()
    .from("autoresponders")
    .insert({ guild_id: guildId, trigger, response, match_type: matchType });
  if (error) throw error;
}

export async function removeAutoresponderWeb(guildId: string, id: string) {
  const { error } = await supabaseAdmin().from("autoresponders").delete().match({ guild_id: guildId, id });
  if (error) throw error;
}

// --- Tags + Economy (dashboard) -------------------------------------------

export type TagRow = { name: string; content: string };

export async function getTagsWeb(guildId: string): Promise<TagRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("tags")
    .select("name, content")
    .eq("guild_id", guildId)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TagRow[];
}

export async function setTagWeb(guildId: string, name: string, content: string) {
  const { error } = await supabaseAdmin()
    .from("tags")
    .upsert({ guild_id: guildId, name, content }, { onConflict: "guild_id,name" });
  if (error) throw error;
}

export async function deleteTagWeb(guildId: string, name: string) {
  const { error } = await supabaseAdmin().from("tags").delete().match({ guild_id: guildId, name });
  if (error) throw error;
}

export async function getTopBalances(guildId: string, limit = 15): Promise<{ user_id: string; balance: number }[]> {
  const { data, error } = await supabaseAdmin()
    .from("economy")
    .select("user_id, balance")
    .eq("guild_id", guildId)
    .order("balance", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({ user_id: r.user_id as string, balance: Number(r.balance) }));
}

// --- Forms (dashboard viewer) ---------------------------------------------

export type FormSummary = { id: string; name: string; questions: number; responses: number };

export async function getFormSummaries(guildId: string): Promise<FormSummary[]> {
  const sb = supabaseAdmin();
  const forms = await sb.from("forms").select("id, name, questions").eq("guild_id", guildId).order("created_at", { ascending: true });
  if (forms.error) throw forms.error;
  const resp = await sb.from("form_responses").select("form_id").eq("guild_id", guildId);
  if (resp.error) throw resp.error;

  const counts = new Map<string, number>();
  for (const r of resp.data ?? []) {
    const fid = (r as { form_id: string }).form_id;
    counts.set(fid, (counts.get(fid) ?? 0) + 1);
  }
  return (forms.data ?? []).map((f) => {
    const row = f as { id: string; name: string; questions: unknown };
    return {
      id: row.id,
      name: row.name,
      questions: Array.isArray(row.questions) ? row.questions.length : 0,
      responses: counts.get(row.id) ?? 0,
    };
  });
}

export type FormResponseRow = {
  id: string;
  userId: string;
  submittedAt: string;
  formName: string;
  answers: Record<string, { label: string; value: string }>;
};

export async function getRecentFormResponses(guildId: string, limit = 20): Promise<FormResponseRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("form_responses")
    .select("id, user_id, answers, submitted_at, forms(name)")
    .eq("guild_id", guildId)
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const rows = (data ?? []) as Array<{
    id: string;
    user_id: string;
    answers: Record<string, { label: string; value: string }> | null;
    submitted_at: string;
    forms: { name: string } | { name: string }[] | null;
  }>;
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    submittedAt: r.submitted_at,
    answers: r.answers ?? {},
    formName: Array.isArray(r.forms) ? r.forms[0]?.name ?? "Form" : r.forms?.name ?? "Form",
  }));
}

// --- Analytics (dashboard viewer) -----------------------------------------

export type AnalyticsSummary = { joins7: number; joins30: number; leaves7: number; leaves30: number };

export async function getAnalyticsSummary(guildId: string): Promise<AnalyticsSummary> {
  const sb = supabaseAdmin();
  async function count(eventType: string, days: number) {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { count, error } = await sb
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("guild_id", guildId)
      .eq("event_type", eventType)
      .gte("created_at", since);
    if (error) throw error;
    return count ?? 0;
  }
  const [joins7, joins30, leaves7, leaves30] = await Promise.all([
    count("join", 7),
    count("join", 30),
    count("leave", 7),
    count("leave", 30),
  ]);
  return { joins7, joins30, leaves7, leaves30 };
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

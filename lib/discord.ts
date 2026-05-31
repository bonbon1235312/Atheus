// Discord API helpers for the dashboard.

const MANAGE_GUILD = 0x20n; // "Manage Server" permission bit

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

export type DiscordRole = {
  id: string;
  name: string;
  managed: boolean;
  position: number;
  color: number;
};

export type DiscordChannel = {
  id: string;
  name: string;
  type: number;
  position?: number;
  parent_id?: string | null;
};

/** True if the user can configure this server (owner or has Manage Server). */
export function canManage(g: DiscordGuild): boolean {
  if (g.owner) return true;
  try {
    return (BigInt(g.permissions) & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}

export function guildIconUrl(g: { id: string; icon: string | null }): string | null {
  return g.icon
    ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
    : null;
}

/** The "Add atheus to your server" invite link (optionally pre-selecting a guild). */
export function inviteUrl(guildId?: string): string {
  const clientId = process.env.AUTH_DISCORD_ID ?? "";
  // Manage Roles + Channels + View + Send + Manage Messages + Reactions + History
  const permissions = "268512336";
  const base =
    `https://discord.com/oauth2/authorize?client_id=${clientId}` +
    `&scope=bot+applications.commands&permissions=${permissions}`;
  return guildId ? `${base}&guild_id=${guildId}` : base;
}

/** Servers the logged-in user is in (uses their OAuth token). */
export async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Discord guilds fetch failed (${res.status})`);
  return res.json();
}

/** Roles in a server (uses the BOT token — the bot must be in the server). */
export async function fetchGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN missing");
  const res = await fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Discord roles fetch failed (${res.status})`);
  return res.json();
}

/** Text channels in a server (uses the BOT token). */
export async function fetchGuildTextChannels(guildId: string): Promise<DiscordChannel[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN missing");
  const res = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Discord channels fetch failed (${res.status})`);
  const channels = (await res.json()) as DiscordChannel[];
  return channels
    .filter((channel) => channel.type === 0 || channel.type === 5)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

/** Add the bot's reaction to the target message so the rule is visible in Discord. */
export async function addBotReaction(channelId: string, messageId: string, emojiKey: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN missing");

  const res = await fetch(
    `https://discord.com/api/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(
      emojiKey
    )}/@me`,
    {
      method: "PUT",
      headers: { Authorization: `Bot ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error(`Discord reaction add failed (${res.status})`);
}

export type DiscordUser = { id: string; displayName: string; avatarUrl: string };

/** Resolve a Discord user's name + avatar by ID (uses the BOT token). */
export async function fetchDiscordUser(userId: string): Promise<DiscordUser | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  const res = await fetch(`https://discord.com/api/users/${userId}`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const u = (await res.json()) as { id: string; username: string; global_name?: string; avatar?: string };
  const avatarUrl = u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(u.id) >> 22n) % 6n)}.png`;
  return { id: u.id, displayName: u.global_name || u.username, avatarUrl };
}

/** Resolve many users in parallel into a Map keyed by ID. */
export async function fetchDiscordUsers(ids: string[]): Promise<Map<string, DiscordUser>> {
  const entries = await Promise.all(ids.map(async (id) => [id, await fetchDiscordUser(id)] as const));
  const map = new Map<string, DiscordUser>();
  for (const [id, u] of entries) if (u) map.set(id, u);
  return map;
}

/** All channels in a server (uses the BOT token). */
export async function fetchGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN missing");
  const res = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Discord channels fetch failed (${res.status})`);
  return (await res.json()) as DiscordChannel[];
}

export async function fetchGuildVoiceChannels(guildId: string): Promise<DiscordChannel[]> {
  return (await fetchGuildChannels(guildId))
    .filter((c) => c.type === 2)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export async function fetchGuildCategories(guildId: string): Promise<DiscordChannel[]> {
  return (await fetchGuildChannels(guildId))
    .filter((c) => c.type === 4)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

/** Roles a user can assign as an auto-role: real, assignable, highest first. */
export function assignableRoles(roles: DiscordRole[]): DiscordRole[] {
  return roles
    .filter((r) => r.name !== "@everyone" && !r.managed)
    .sort((a, b) => b.position - a.position);
}

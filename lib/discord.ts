import "server-only";

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

export type ManagedDiscordGuild = DiscordGuild & {
  botInstalled: boolean;
};

export type DiscordGuildVerification = {
  botInstalled: boolean;
  memberCount: number | null;
};

const ADMINISTRATOR = 1n << 3n;
const MANAGE_GUILD = 1n << 5n;

function canManageGuild(guild: DiscordGuild) {
  const permissions = BigInt(guild.permissions);
  return (
    guild.owner ||
    (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
    (permissions & MANAGE_GUILD) === MANAGE_GUILD
  );
}

async function fetchDiscordGuilds(
  authorization: string,
): Promise<DiscordGuild[]> {
  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: { Authorization: authorization },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Discord guild lookup failed with ${response.status}.`);
  }

  return (await response.json()) as DiscordGuild[];
}

export async function getManagedDiscordGuilds(
  accessToken: string,
): Promise<ManagedDiscordGuild[]> {
  const userGuilds = await fetchDiscordGuilds(`Bearer ${accessToken}`);
  const botToken =
    process.env.ATHEUS_DISCORD_BOT_TOKEN ?? process.env.DISCORD_BOT_TOKEN;

  let botGuildIds = new Set<string>();
  if (botToken) {
    const botGuilds = await fetchDiscordGuilds(`Bot ${botToken}`);
    botGuildIds = new Set(botGuilds.map((guild) => guild.id));
  }

  return userGuilds
    .filter(canManageGuild)
    .map((guild) => ({
      ...guild,
      botInstalled: botGuildIds.has(guild.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDiscordGuildVerification(
  guildId: string,
): Promise<DiscordGuildVerification> {
  const botToken =
    process.env.ATHEUS_DISCORD_BOT_TOKEN ?? process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return { botInstalled: false, memberCount: null };
  }

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
    {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    },
  );

  if (response.status === 404 || response.status === 403) {
    return { botInstalled: false, memberCount: null };
  }

  if (!response.ok) {
    throw new Error(`Discord guild verification failed with ${response.status}.`);
  }

  const guild = (await response.json()) as {
    approximate_member_count?: number;
  };

  return {
    botInstalled: true,
    memberCount:
      typeof guild.approximate_member_count === "number"
        ? guild.approximate_member_count
        : null,
  };
}

export function getAtheusBotInviteUrl(guildId?: string) {
  const clientId =
    process.env.ATHEUS_BOT_CLIENT_ID ?? process.env.AUTH_DISCORD_ID;

  if (!clientId) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "bot applications.commands",
    permissions: process.env.ATHEUS_BOT_PERMISSIONS ?? "268561424",
  });

  if (guildId) {
    params.set("guild_id", guildId);
    params.set("disable_guild_select", "true");
  }

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

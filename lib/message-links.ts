const messageLinkPattern =
  /^https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(?<guildId>\d+)\/(?<channelId>\d+)\/(?<messageId>\d+)$/;

export function parseDiscordMessageLink(link: string) {
  const match = link.trim().match(messageLinkPattern);
  if (!match?.groups) return null;

  return {
    guildId: match.groups.guildId,
    channelId: match.groups.channelId,
    messageId: match.groups.messageId,
  };
}

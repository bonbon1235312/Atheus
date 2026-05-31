// Shared site constants.

export const DISCORD_CLIENT_ID = "1510251822105890896";

// "Add to Discord" invite. Permissions = Manage Server + Roles + Channels + View
// + Send + Embed Links + Attach Files + Manage Messages + Reactions + History
// + Move Members + Connect + Speak (288484464). Scopes bot + commands.
export const INVITE_URL =
  `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
  `&permissions=288484464&scope=bot+applications.commands`;

export const SUPPORT_EMAIL = "hello@atheus.dev";

export const DISCORD_SERVER_URL = "https://discord.gg/ZspegmXTvk";

export const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

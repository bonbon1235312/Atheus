const DEFAULT_ROOT_DOMAIN = "atheus.dev";

export const RESERVED_LEAGUE_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "cdn",
  "dashboard",
  "docs",
  "help",
  "mail",
  "status",
  "support",
  "www",
]);

export function atheusRootDomain() {
  return (
    process.env.ATHEUS_ROOT_DOMAIN?.trim().toLowerCase() ||
    DEFAULT_ROOT_DOMAIN
  );
}

export function leaguePublicUrl(slug: string, path = "") {
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `https://${slug}.${atheusRootDomain()}${normalizedPath}`;
}

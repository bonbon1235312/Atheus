import { DEMO_SITE_SLUGS } from "@/lib/demo-sites";

const DEFAULT_ROOT_DOMAIN = "atheus.dev";

export const RESERVED_LEAGUE_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "cdn",
  "dashboard",
  "demos",
  "docs",
  "help",
  "mail",
  "status",
  "support",
  "www",
  ...DEMO_SITE_SLUGS,
]);

export function atheusRootDomain() {
  return (
    process.env.ATHEUS_ROOT_DOMAIN?.trim().toLowerCase() ||
    DEFAULT_ROOT_DOMAIN
  );
}

function slugFromHostname(hostname: string): string | null {
  const rootDomain = atheusRootDomain();
  const normalized = hostname.toLowerCase().split(":")[0];
  const suffix = `.${rootDomain}`;

  if (!normalized.endsWith(suffix)) {
    return null;
  }

  const slug = normalized.slice(0, -suffix.length);
  if (!slug || slug.includes(".") || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }

  return slug;
}

/**
 * Resolve a Sites demo slug from an incoming hostname such as
 * `hearth-co.atheus.dev`.
 */
export function demoSlugFromHostname(hostname: string): string | null {
  const slug = slugFromHostname(hostname);
  if (!slug || !DEMO_SITE_SLUGS.has(slug)) {
    return null;
  }
  return slug;
}

/**
 * Resolve a tenant league slug from an incoming hostname such as
 * `elite-pro-clubs.atheus.dev`. Returns null for the apex/www domain,
 * reserved subdomains, Sites demos, or anything that is not a single valid slug label.
 */
export function leagueSlugFromHostname(hostname: string): string | null {
  const slug = slugFromHostname(hostname);
  if (!slug || RESERVED_LEAGUE_SLUGS.has(slug)) {
    return null;
  }
  return slug;
}

export function leaguePublicUrl(slug: string, path = "") {
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `https://${slug}.${atheusRootDomain()}${normalizedPath}`;
}

export function demoPublicUrl(slug: string, path = "") {
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `https://${slug}.${atheusRootDomain()}${normalizedPath}`;
}

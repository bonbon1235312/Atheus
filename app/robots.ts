import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import {
  demoSlugFromHostname,
  leaguePublicUrl,
  leagueSlugFromHostname,
} from "@/lib/public-url";
import { SITE_ORIGIN } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hostname = (await headers()).get("host")?.split(":")[0].toLowerCase() ?? "";

  if (demoSlugFromHostname(hostname)) {
    // Crawlers need access to the page-level noindex directive.
    return { rules: { userAgent: "*", allow: "/" } };
  }

  const leagueSlug = leagueSlugFromHostname(hostname);
  const origin = leagueSlug ? leaguePublicUrl(leagueSlug) : SITE_ORIGIN;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin pages are crawlable so their noindex directive can be read.
      disallow: ["/api/", "/tenant/", "/monitoring"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}

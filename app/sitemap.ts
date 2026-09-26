import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { selectedWork } from "@/lib/work";
import {
  demoSlugFromHostname,
  leaguePublicUrl,
  leagueSlugFromHostname,
} from "@/lib/public-url";
import { SITE_ORIGIN } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hostname = (await headers()).get("host")?.split(":")[0].toLowerCase() ?? "";

  // Concept demos are intentionally noindex, so they have no sitemap entries.
  if (demoSlugFromHostname(hostname)) return [];

  const leagueSlug = leagueSlugFromHostname(hostname);
  if (leagueSlug) {
    try {
      const { data: league } = await supabaseAdmin()
        .from("leagues")
        .select("slug")
        .eq("slug", leagueSlug)
        .eq("status", "active")
        .maybeSingle();

      if (!league) return [];

      const root = leaguePublicUrl(leagueSlug);
      return ["", "/fixtures", "/table", "/stats"].map((path) => ({
        url: `${root}${path}`,
      }));
    } catch {
      // An unavailable data service should not expose another host's URLs.
      return [];
    }
  }

  return [
    "/",
    "/work",
    ...selectedWork.map((project) => project.href),
    "/services",
    "/studio",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({ url: new URL(path, SITE_ORIGIN).toString() }));
}

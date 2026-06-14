import type { MetadataRoute } from "next";

import { leaguePublicUrl } from "@/lib/public-url";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  try {
    const { data: leagues } = await supabaseAdmin()
      .from("leagues")
      .select("slug, updated_at")
      .eq("status", "active");

    for (const league of leagues ?? []) {
      const root = leaguePublicUrl(league.slug as string);
      entries.push(
        {
          url: root,
          lastModified: new Date(league.updated_at),
          changeFrequency: "daily",
          priority: 0.9,
        },
        {
          url: `${root}/fixtures`,
          lastModified: new Date(league.updated_at),
          changeFrequency: "hourly",
          priority: 0.8,
        },
        {
          url: `${root}/table`,
          lastModified: new Date(league.updated_at),
          changeFrequency: "hourly",
          priority: 0.8,
        },
        {
          url: `${root}/stats`,
          lastModified: new Date(league.updated_at),
          changeFrequency: "hourly",
          priority: 0.8,
        },
      );
    }
  } catch {
    // Keep the root sitemap available before deployment environment setup.
  }

  return entries;
}

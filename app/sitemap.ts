import type { MetadataRoute } from "next";

import { products } from "@/lib/products";
import { leaguePublicUrl } from "@/lib/public-url";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
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
    // Keep the marketing sitemap available before deployment environment setup.
  }

  return entries;
}

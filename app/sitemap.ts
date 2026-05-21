import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://atheus.dev";
  const lastModified = new Date();

  const staticPages: { path: string; priority: number; changeFrequency: "monthly" | "weekly" | "yearly" }[] = [
    { path: "", priority: 1, changeFrequency: "monthly" },
    { path: "/work", priority: 0.9, changeFrequency: "monthly" },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.85, changeFrequency: "monthly" },
    { path: "/process", priority: 0.7, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  const caseStudies = projects.map((project) => ({
    url: `${base}/work/${project.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const demos = projects.map((project) => ({
    url: `${base}/demos/${project.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages.map((page) => ({
      url: `${base}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...caseStudies,
    ...demos,
  ];
}

export type DemoSite = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  accent: string;
  image: string;
};

export const DEMO_SITES: DemoSite[] = [
  {
    slug: "hearth-co",
    name: "Hearth & Co",
    tagline: "Coffee worth the walk.",
    category: "Cafe",
    description:
      "A warm neighbourhood cafe site — menu, hours, and atmosphere without looking templated.",
    accent: "#c48a4a",
    image: "/brand/sites-hearth.jpg",
  },
  {
    slug: "rivermark",
    name: "Rivermark Studio",
    tagline: "Spaces that earn silence.",
    category: "Architecture",
    description:
      "An architecture studio site with editorial type, project gravity, and calm navigation.",
    accent: "#d4a24c",
    image: "/brand/sites-river.jpg",
  },
  {
    slug: "atelier",
    name: "Atelier",
    tagline: "Strategic design. Real business impact.",
    category: "Agency",
    description:
      "A design agency site with clear services, transparent pricing, and premium craft.",
    accent: "#c9a46c",
    image: "/brand/sites-showcase-2.jpg",
  },
];

export const DEMO_SITE_SLUGS = new Set(DEMO_SITES.map((site) => site.slug));

export function getDemoSite(slug: string) {
  return DEMO_SITES.find((site) => site.slug === slug) ?? null;
}

export function isDemoSiteSlug(slug: string) {
  return DEMO_SITE_SLUGS.has(slug);
}

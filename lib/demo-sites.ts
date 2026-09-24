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
    slug: "ridgeway",
    name: "Ridgeway Civils",
    tagline: "Plant, ground, concrete.",
    category: "Construction",
    description:
      "A stark civils contractor site: heavy type, high-contrast plant photography, and a tender path that feels like a real yard.",
    accent: "#f5c400",
    image: "/brand/ridgeway-hero.jpg",
  },
  {
    slug: "northline",
    name: "Northline Electrical",
    tagline: "Commercial power. 24/7 call-out.",
    category: "Trades",
    description:
      "A bright, precise contractor site with a service selector, a real quote questionnaire, and an emergency number you cannot miss.",
    accent: "#0a5cff",
    image: "/brand/northline-hero.jpg",
  },
  {
    slug: "hearth-co",
    name: "Hearth & Co",
    tagline: "Coffee worth the walk.",
    category: "Cafe",
    description:
      "A warm neighbourhood cafe site with a live filterable menu and a table booking calendar, built for a phone in a queue.",
    accent: "#c48a4a",
    image: "/brand/sites-hearth.jpg",
  },
];

export const DEMO_SITE_SLUGS = new Set(DEMO_SITES.map((site) => site.slug));

export function getDemoSite(slug: string) {
  return DEMO_SITES.find((site) => site.slug === slug) ?? null;
}

export function isDemoSiteSlug(slug: string) {
  return DEMO_SITE_SLUGS.has(slug);
}

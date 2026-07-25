export type ProductStatus = "live" | "beta" | "building";

export type PricingTier = {
  name: string;
  price: string;
  body: string;
  featured?: boolean;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  category: string;
  image: string;
  imageAlt: string;
  mark: string;
  accent: string;
  highlights: { label: string; value: string }[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  pricingNote: string;
  pricingTiers: PricingTier[];
  capabilities: { title: string; body: string }[];
  benefits: { title: string; body: string }[];
  architecture: string[];
  faqs: { q: string; a: string }[];
};

export const products: Product[] = [
  {
    slug: "league",
    name: "League",
    tagline: "Season operations for competitive communities.",
    description:
      "Multi-tenant league infrastructure with fixtures, standings, player stats, Discord auth, and automated data collection. Built for organisations that run seasons at scale.",
    status: "live",
    category: "Operations",
    image: "/brand/league-product.png",
    imageAlt: "League admin interface showing fixtures, standings, and season controls",
    mark: "L",
    accent: "#3dba84",
    highlights: [
      { label: "Tenancy", value: "Per-league isolation" },
      { label: "Sites", value: "Branded subdomains" },
      { label: "Ops", value: "Automated collection" },
    ],
    primaryCta: { label: "Open platform", href: "/admin" },
    secondaryCta: { label: "Contact", href: "/contact" },
    pricingNote:
      "Free for one active league. Premium unlocks unlimited leagues for £8 per month.",
    pricingTiers: [
      {
        name: "Free",
        price: "£0",
        body: "One active league with the full core feature set.",
      },
      {
        name: "Premium",
        price: "£8 / mo",
        body: "Unlimited leagues and priority platform support.",
        featured: true,
      },
    ],
    capabilities: [
      {
        title: "Season control",
        body: "Divisions, fixtures, results review, and standings from one workspace. Configure once, run every matchweek.",
      },
      {
        title: "Public league sites",
        body: "Each league gets a branded site on its own subdomain. Fixtures, tables, and stats that members actually open.",
      },
      {
        title: "Automated collection",
        body: "Pull match data from external sources, queue imports, and approve results without spreadsheet chaos.",
      },
      {
        title: "Staff and access",
        body: "Discord OAuth for owners, site credentials for operators, and role-aware admin surfaces.",
      },
    ],
    benefits: [
      {
        title: "Fewer manual hours",
        body: "Automation handles collection and structure so staff focus on decisions, not data entry.",
      },
      {
        title: "One system per league",
        body: "Isolation by tenant. Branding, data, and access stay scoped to the organisation that owns them.",
      },
      {
        title: "Built for reliability",
        body: "Typed APIs, durable storage, and workflows designed for weekly operational load.",
      },
    ],
    architecture: [
      "Next.js App Router",
      "Supabase PostgreSQL",
      "Discord OAuth",
      "Subdomain tenancy",
      "Background collectors",
    ],
    faqs: [
      {
        q: "Who is League for?",
        a: "Competitive communities and organisations that need fixtures, standings, and player stats without building custom tooling every season.",
      },
      {
        q: "Can each league have its own brand?",
        a: "Yes. Public sites support per-league colour systems and crest assets while sharing the same platform core.",
      },
      {
        q: "How do admins sign in?",
        a: "League owners authenticate with Discord. Operators can also use league site credentials when Discord is not the right path.",
      },
    ],
  },
  {
    slug: "club",
    name: "Club",
    tagline: "Member operations for a single organisation.",
    description:
      "A focused operations layer for clubs and teams: membership, availability, schedules, and shared records. Lighter than League when you do not need a full multi-tenant season stack.",
    status: "beta",
    category: "Community",
    image: "/brand/club-product.png",
    imageAlt: "Club interface showing member directory, availability, and schedules",
    mark: "C",
    accent: "#e8a23a",
    highlights: [
      { label: "Scope", value: "Single organisation" },
      { label: "Focus", value: "Members and schedules" },
      { label: "Path", value: "Grows into League" },
    ],
    primaryCta: { label: "Request beta", href: "/contact" },
    secondaryCta: { label: "Compare to League", href: "/products/league" },
    pricingNote: "Beta pricing is limited. Early partners get preferential rates at general availability.",
    pricingTiers: [
      {
        name: "Beta",
        price: "Contact",
        body: "Early access for clubs ready to replace Discord-and-spreadsheet ops.",
      },
      {
        name: "Organisation",
        price: "Custom",
        body: "Production use with onboarding support and priority response.",
        featured: true,
      },
    ],
    capabilities: [
      {
        title: "Member directory",
        body: "Keep roles, identities, and contact paths in one place instead of scattered Discord pins and sheets.",
      },
      {
        title: "Availability and scheduling",
        body: "Collect who can play, lock lineups, and publish schedules without chasing replies across channels.",
      },
      {
        title: "Shared club records",
        body: "Match notes, attendance, and internal history that survive season turnover.",
      },
      {
        title: "Lightweight admin",
        body: "A calm control surface for captains and managers. Enough structure, no enterprise bloat.",
      },
    ],
    benefits: [
      {
        title: "Right-sized tooling",
        body: "Designed for a single club, not a federation. Faster setup, clearer ownership.",
      },
      {
        title: "Less Discord debt",
        body: "Replace fragile channel rituals with durable records and predictable workflows.",
      },
      {
        title: "Ready to grow",
        body: "When a club becomes a league, the path into League keeps your operational habits intact.",
      },
    ],
    architecture: [
      "TypeScript services",
      "PostgreSQL",
      "Event-driven jobs",
      "Role-based access",
      "API-first design",
    ],
    faqs: [
      {
        q: "How is Club different from League?",
        a: "Club serves one organisation. League serves multi-team seasons with public sites, divisions, and automated match pipelines.",
      },
      {
        q: "Is Club available now?",
        a: "Club is in beta with early partners. Contact us if you want access for your organisation.",
      },
      {
        q: "Does Club require Discord?",
        a: "Discord integration is optional. Core operations work from the web admin.",
      },
    ],
  },
  {
    slug: "blackwall",
    name: "BlackWall",
    tagline: "Access control for automated systems.",
    description:
      "A policy and access layer for APIs, bots, and internal tools. Define who and what can run, with audit trails that make automation safe to scale.",
    status: "building",
    category: "Security",
    image: "/brand/blackwall-product.png",
    imageAlt: "BlackWall console showing policies, service identities, and audit events",
    mark: "B",
    accent: "#7aa2ff",
    highlights: [
      { label: "Model", value: "Policy as code" },
      { label: "Actors", value: "Services and bots" },
      { label: "Trail", value: "Readable audits" },
    ],
    primaryCta: { label: "Join waitlist", href: "/contact" },
    secondaryCta: { label: "All products", href: "/products" },
    pricingNote: "Waitlist only. Pricing will be published with the first private beta.",
    pricingTiers: [
      {
        name: "Waitlist",
        price: "Free",
        body: "Architecture notes and early access invitations as BlackWall opens.",
      },
      {
        name: "Private beta",
        price: "Custom",
        body: "Scoped rollout for teams running automated services in production.",
        featured: true,
      },
    ],
    capabilities: [
      {
        title: "Policy as code",
        body: "Express allow and deny rules for services, tokens, and operators in a format teams can review.",
      },
      {
        title: "Service identity",
        body: "Give bots and workers first-class identities instead of shared secrets living in five places.",
      },
      {
        title: "Audit without noise",
        body: "Readable event history for access decisions. Enough detail for incident review, not a firehose.",
      },
      {
        title: "Automation-safe defaults",
        body: "Fail closed where it matters. Fast path for trusted internal traffic.",
      },
    ],
    benefits: [
      {
        title: "Scale automation safely",
        body: "More bots and jobs should not mean more silent privilege. BlackWall keeps the blast radius small.",
      },
      {
        title: "Clear ownership",
        body: "Every credential and policy has an owner. Rotation and revocation become routine, not emergencies.",
      },
      {
        title: "Fits modern stacks",
        body: "Built for TypeScript services, containers, and cloud environments without forcing a heavyweight IAM suite.",
      },
    ],
    architecture: [
      "Rust policy core",
      "TypeScript SDKs",
      "PostgreSQL audit store",
      "Edge-friendly checks",
      "OpenAPI contracts",
    ],
    faqs: [
      {
        q: "Is BlackWall a firewall product?",
        a: "No. It is an application and automation access layer focused on identity, policy, and audit for software systems.",
      },
      {
        q: "When will it ship?",
        a: "BlackWall is under active design. Join the waitlist via contact if you want early architecture notes and beta access.",
      },
      {
        q: "Will it integrate with League and Club?",
        a: "Yes. Internal Atheus products will use BlackWall for service credentials and operator access as it matures.",
      },
    ],
  },
  {
    slug: "sites",
    name: "Sites",
    tagline: "Fully custom websites, priced to the build.",
    description:
      "Bespoke marketing sites and web experiences designed and engineered end to end. Every project is custom. Scope sets the price, from focused landings to multi-page brand systems and richer web products.",
    status: "live",
    category: "Studio",
    image: "/brand/sites-hearth.jpg",
    imageAlt: "Custom cafe website example built for a small business",
    mark: "S",
    accent: "#f0c27a",
    highlights: [
      { label: "Build", value: "Fully custom" },
      { label: "Entry", value: "From £600" },
      { label: "Stack", value: "Modern web" },
    ],
    primaryCta: { label: "Request a quote", href: "/contact" },
    secondaryCta: { label: "See pricing", href: "/products/sites#pricing" },
    pricingNote:
      "Small business sites start at £600. Larger brand sites and custom builds are quoted by scope after a short brief.",
    pricingTiers: [
      {
        name: "Small business",
        price: "From £600",
        body: "A focused site for a small business: clear pages, strong hierarchy, and production polish.",
        featured: true,
      },
      {
        name: "Brand site",
        price: "£4k–£12k",
        body: "Multi-page custom website with stronger art direction, content structure, and responsive craft.",
      },
      {
        name: "Custom build",
        price: "Quote",
        body: "Larger sites, portals, or product-adjacent web experiences. Scoped after discovery.",
      },
    ],
    capabilities: [
      {
        title: "Custom design systems",
        body: "Typography, colour, spacing, and components built for your brand. No template skinning.",
      },
      {
        title: "Production engineering",
        body: "Fast, accessible, responsive frontends on modern stacks. Deployed cleanly and ready to maintain.",
      },
      {
        title: "Content-ready structure",
        body: "Sections, pages, and CMS-friendly patterns so the site can grow without a redesign every quarter.",
      },
      {
        title: "Motion with restraint",
        body: "Scroll reveals, micro-interactions, and presence that support the brand without slowing the page.",
      },
    ],
    benefits: [
      {
        title: "One team, design to ship",
        body: "Strategy, interface, and engineering stay in one loop. Fewer handoffs and fewer diluted decisions.",
      },
      {
        title: "Price matched to scope",
        body: "You are not forced into one package. Small business, brand site, or custom build depending on what you need.",
      },
      {
        title: "Built to look intentional",
        body: "The goal is a site that feels engineered and premium, not generated from a SaaS template.",
      },
    ],
    architecture: [
      "Next.js",
      "TypeScript",
      "Custom design systems",
      "Performance-first delivery",
      "Accessible markup",
    ],
    faqs: [
      {
        q: "Are these templates?",
        a: "No. Sites projects are designed and built to the brief. Shared engineering standards, unique visual systems.",
      },
      {
        q: "How does pricing work?",
        a: "Small business sites start at £600. After a short brief we confirm scope, timeline, and a fixed quote for that build.",
      },
      {
        q: "Do you handle hosting and domains?",
        a: "Yes when needed. We can ship to your preferred host or set up a clean production environment as part of delivery.",
      },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export const statusLabel: Record<ProductStatus, string> = {
  live: "Live",
  beta: "Beta",
  building: "Building",
};

export type ProjectSlug =
  | "hawthorne-electrical"
  | "saplings"
  | "forge-house"
  | "cinder-clover";

export type Project = {
  slug: ProjectSlug;
  name: string;
  industry: string;
  concept: string;
  keyLine: string;
  demoHref: string;
  style: string;
  palette: { name: string; value: string; text: "dark" | "light" }[];
  typography: string;
  focus: string[];
  sections: string[];
  improvements: string[];
  summary: string;
};

export const projects: Project[] = [
  {
    slug: "hawthorne-electrical",
    name: "Hawthorne Electrical",
    industry: "Electrical / trades",
    concept:
      "A credible Sheffield electrical firm with editorial trade-brand styling and practical call-first conversion.",
    keyLine: "Electrical work, done properly.",
    demoHref: "/demos/hawthorne-electrical",
    style:
      "Bone paper background, deep ink, brick-red accent, structured service blocks, and grounded trust signals.",
    typography: "Serif display type for authority paired with compact sans-serif service information.",
    summary:
      "A trades website repositioned away from generic blue vans and stock icons into a sharper, more believable local business presence.",
    palette: [
      { name: "Bone", value: "#f2eadc", text: "dark" },
      { name: "Deep ink", value: "#171512", text: "light" },
      { name: "Brick", value: "#a84834", text: "light" },
      { name: "Brass", value: "#c59a57", text: "dark" },
    ],
    focus: [
      "Moved away from generic trades website cliches.",
      "Improved trust, readability, and call-focused conversion.",
      "Created a practical service layout with clear emergency messaging.",
    ],
    sections: [
      "Call-first hero",
      "Emergency and planned work split",
      "Trust strip",
      "Service list",
      "How it works",
      "Quote CTA",
    ],
    improvements: [
      "Made the phone action visible in every major conversion moment.",
      "Grouped services by real customer intent instead of vague categories.",
      "Added plain-language reassurance around safety, pricing, and response times.",
    ],
  },
  {
    slug: "saplings",
    name: "Saplings",
    industry: "Restaurant / bistro",
    concept:
      "A small Manchester seasonal neighbourhood bistro with an editorial identity and warmer booking journey.",
    keyLine: "Seasonal neighbourhood bistro.",
    demoHref: "/demos/saplings",
    style:
      "Magazine-cover composition, warm restaurant photography cues, copper accent, and expressive serif type.",
    typography:
      "Elegant high-contrast serif headlines with restrained sans-serif details for menu and booking clarity.",
    summary:
      "A hospitality site designed to feel specific, local, and confident instead of relying on generic fine-dining cues.",
    palette: [
      { name: "Charcoal", value: "#17110e", text: "light" },
      { name: "Cream", value: "#f4ead8", text: "dark" },
      { name: "Copper", value: "#c47a4c", text: "light" },
      { name: "Moss", value: "#7b8462", text: "light" },
    ],
    focus: [
      "Built an editorial restaurant identity.",
      "Created clearer booking CTAs and opening information.",
      "Designed a weekly menu layout with specific hospitality copy.",
    ],
    sections: [
      "Restaurant-coded hero",
      "Weekly menu",
      "Chef note",
      "Press proof",
      "Booking",
      "Location",
    ],
    improvements: [
      "Made the menu feel current and valuable instead of decorative.",
      "Reduced vague atmosphere copy and added concrete service information.",
      "Gave booking a stronger place in the journey.",
    ],
  },
  {
    slug: "forge-house",
    name: "Forge House",
    industry: "Gym / fitness",
    concept:
      "A serious independent strength gym in Leeds with gritty positioning and a trial-focused conversion path.",
    keyLine: "Train hard. Stay consistent.",
    demoHref: "/demos/forge-house",
    style:
      "Black, off-white, burnt orange, oversized condensed type, and structured training information.",
    typography:
      "Condensed display type for impact with clean sans-serif detail for schedules, coaching, and membership content.",
    summary:
      "A fitness brand that avoids glossy wellness tropes and focuses on discipline, coaching, and first-week momentum.",
    palette: [
      { name: "Black", value: "#070707", text: "light" },
      { name: "Off-white", value: "#f3ead8", text: "dark" },
      { name: "Burnt orange", value: "#ed6a24", text: "dark" },
      { name: "Steel", value: "#8d95a5", text: "dark" },
    ],
    focus: [
      "Created gritty strength-first positioning.",
      "Avoided generic fitness cliches.",
      "Built a trial-focused path through classes, coaching, and memberships.",
    ],
    sections: [
      "Strength hero",
      "Class structure",
      "Coaching team",
      "First week process",
      "Trial CTA",
      "Location",
    ],
    improvements: [
      "Made the offer concrete for new members who need structure.",
      "Shifted the visual language from generic gym hype to credible strength coaching.",
      "Used trial conversion as the main commercial action.",
    ],
  },
  {
    slug: "cinder-clover",
    name: "Cinder & Clover",
    industry: "Cafe / brunch",
    concept:
      "A warm York neighbourhood cafe with premium restraint, better booking clarity, and private hire positioning.",
    keyLine: "Slow coffee. Sharp brunch.",
    demoHref: "/demos/cinder-clover",
    style:
      "Cream, espresso, clay accent, editorial cafe photography cues, and calm hospitality pacing.",
    typography:
      "Expressive serif headlines with practical sans-serif UI for menu, booking, and visit details.",
    summary:
      "A cafe site rebuilt to sell the room, the menu, and private hire without losing the warmth of a local spot.",
    palette: [
      { name: "Cream", value: "#f7f1e7", text: "dark" },
      { name: "Espresso", value: "#241814", text: "light" },
      { name: "Clay", value: "#aa6348", text: "light" },
      { name: "Olive", value: "#6f7d59", text: "light" },
    ],
    focus: [
      "Created a cafe identity with premium restraint.",
      "Strengthened the hero hierarchy.",
      "Improved brunch/menu presentation and private hire clarity.",
    ],
    sections: [
      "Cafe hero",
      "Trust proof",
      "Brunch board",
      "Why choose us",
      "Private hire",
      "Booking CTA",
    ],
    improvements: [
      "Made the first viewport specific and commercially useful.",
      "Added a clearer reason to book rather than only browse.",
      "Positioned private hire as a real revenue stream.",
    ],
  },
];

export const featuredProjects = projects;

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export const selectedWork = [
  { slug: "kickoff", name: "KickOff", category: "Digital product", status: "Atheus Original / Live platform", summary: "Making every match part of a bigger story. A competitive platform connecting game data, Discord communities and the open web.", image: "/work/kickoff-desktop.webp", href: "/work/kickoff", width: 1440, height: 1000 },
  { slug: "hearth-and-co", name: "Hearth & Co", category: "Hospitality", status: "Concept", summary: "A neighbourhood cafe with a digital presence as inviting as the place itself.", image: "/brand/sites-hearth.jpg", href: "/work/hearth-and-co", width: 1500, height: 900 },
  { slug: "ridgeway-civils", name: "Ridgeway Civils", category: "Construction", status: "Concept", summary: "Heavy industry, presented with the confidence and clarity it deserves.", image: "/brand/ridgeway-hero.jpg", href: "/work/ridgeway-civils", width: 1500, height: 900 },
  { slug: "northline-electrical", name: "Northline Electrical", category: "Trades", status: "Concept", summary: "A precise service experience shaped around two different needs: an urgent call-out and a considered project enquiry.", image: "/brand/northline-hero.jpg", href: "/work/northline-electrical", width: 1500, height: 900 },
] as const;

// Public aggregates supplied by the owner. Keep this date with every use of the figures.
// This is a reporting snapshot, not a live counter or an uptime measurement.
export const kickoffSnapshot = {
  date: "26 September 2026, 14:39 BST",
  matches: "10,709",
  performances: "63,701",
  players: "3,052",
  activeClubs: "53",
  posted: "10,635",
  failed: "74",
  postedPercent: "99.31%",
} as const;


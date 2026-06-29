import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Deployed platforms, active research and experimental builds from Atheus Industries.",
};

const projects = [
  {
    id: "league-platform",
    status: "Case Study",
    statusKey: "archived",
    title: "League Platform",
    sub: "Full-stack multi-tenant SaaS",
    year: "2024",
    description:
      "A complete league management system built for EA FC Pro Clubs communities. Multi-tenant architecture with custom subdomain routing, automated match detection via the EA FC API, live season statistics, player card tracking, and an admin workspace for commissioners. Built on Next.js, Supabase, and Auth.js. Still live and serving active leagues.",
    tags: ["Next.js", "Supabase", "Auth.js", "EA FC API", "Discord OAuth", "PostgreSQL"],
    note: "Archived as a case study. The platform remains live — the league tooling continues to run under the Atheus umbrella.",
  },
  {
    id: "eden",
    status: "Research",
    statusKey: "research",
    title: "EDEN",
    sub: "AI civilisation simulator",
    year: "2026",
    description:
      "A multi-agent civilisation simulation engine. AI agents represent population groups, governments, and organisations — making decisions, forming alliances, and responding to simulated events within a persistent world state. Architecture is designed for multi-agent Claude Code + Codex collaboration. Research project, not a game.",
    tags: ["Multi-agent AI", "Claude API", "Simulation", "Python"],
    note: "Active research and architecture phase.",
  },
  {
    id: "acl-bot",
    status: "Deployed",
    statusKey: "deployed",
    title: "ACL Bot",
    sub: "Discord community tooling",
    year: "2025",
    description:
      "A Discord bot built for a gaming community. Handles role management, match reporting, command-driven utilities, and integration with external systems. Built with discord.py and Supabase for persistent state. Deployed and actively used.",
    tags: ["discord.py", "Python", "Supabase", "Discord API"],
    note: "Live and deployed.",
  },
];

export default function Projects() {
  return (
    <div className="ai-page">
      <header className="ai-nav">
        <Link className="ai-brand" href="/" aria-label="Atheus Industries home">
          <span aria-hidden="true">AI</span>
          <strong>Atheus Industries</strong>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link className="ai-nav-action" href="/admin">
          Platform login
        </Link>
      </header>

      <section className="ai-page-hero">
        <div className="ai-section-inner">
          <span className="ai-kicker">What we&apos;ve built</span>
          <h1>Projects & Lab</h1>
          <p>
            Deployed platforms, active research and experimental builds. Every entry is
            real work, honestly described.
          </p>
        </div>
      </section>

      <section>
        <div className="ai-section-inner">
          {projects.map((p) => (
            <article key={p.id} className="ai-project-full">
              <header className="ai-project-full-header">
                <div>
                  <span className={`ai-project-status is-${p.statusKey}`}>{p.status}</span>
                  <h2>{p.title}</h2>
                  <p className="ai-project-sub">{p.sub}</p>
                </div>
                <span className="ai-project-year">{p.year}</span>
              </header>

              <p className="ai-project-full-body">{p.description}</p>

              {p.note && (
                <p className="ai-project-note">{p.note}</p>
              )}

              <footer className="ai-project-full-footer">
                {p.tags.map((t) => (
                  <span className="ai-tag" key={t}>{t}</span>
                ))}
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-cta-section">
        <div className="ai-section-inner">
          <div className="ai-cta-inner">
            <span className="ai-kicker">Work with us</span>
            <h2>Have a project in mind?</h2>
            <p>
              We build websites, automation tools, Discord bots, AI systems and hardware
              prototypes. Tell us what you need.
            </p>
            <Link className="ai-btn ai-btn-primary" href="/contact">
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      <footer className="ai-footer">
        <div className="ai-footer-inner">
          <div className="ai-footer-brand">
            <Link className="ai-brand" href="/">
              <span aria-hidden="true">AI</span>
              <strong>Atheus Industries</strong>
            </Link>
            <p>Engineering intelligent systems across web, AI and robotics.</p>
          </div>
          <nav aria-label="Studio navigation">
            <p>Studio</p>
            <Link href="/about">About</Link>
            <Link href="/services">Services</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <nav aria-label="Platform navigation">
            <p>Platform</p>
            <Link href="/admin">League Dashboard</Link>
          </nav>
          <small>© Atheus Industries 2026</small>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atheus Industries",
  description:
    "Engineering intelligent systems across web, AI and robotics. An early-stage technology studio building websites, automation tools, AI systems and hardware prototypes.",
};

const services = [
  {
    n: "01",
    title: "Web Design & Development",
    body: "Full-stack websites and web applications. From landing pages to multi-tenant platforms, built with modern frameworks and attention to performance and accessibility.",
  },
  {
    n: "02",
    title: "AI Automation Systems",
    body: "Intelligent automation pipelines using LLMs and APIs. Custom agents, data processors and decision systems that reduce manual overhead and operate at scale.",
  },
  {
    n: "03",
    title: "Discord Bots & Software Automation",
    body: "Bots, integrations and automated workflows across platforms. Discord communities, data pipelines, scheduled tasks and custom tooling built to specification.",
  },
  {
    n: "04",
    title: "Robotics & Embedded Systems",
    body: "Physical computing with ESP32, Arduino and similar platforms. Sensor networks, actuator systems and hardware prototypes that bridge software and the real world.",
  },
  {
    n: "05",
    title: "Technical Prototyping",
    body: "Early-stage exploration of new ideas. From concept to working prototype — systems that prove the idea before committing to scale.",
  },
];

const projects = [
  {
    id: "league-platform",
    status: "Case Study",
    statusKey: "archived",
    title: "League Platform",
    sub: "Full-stack multi-tenant SaaS",
    body: "A complete deployed software platform for EA FC Pro Clubs communities. Multi-tenant architecture, Discord OAuth, automated EA data collection, subdomain routing and real-time league statistics. Foundation of the engineering practices at Atheus Industries.",
    tags: ["Next.js", "Supabase", "Discord OAuth", "EA FC API"],
    featured: true,
  },
  {
    id: "eden",
    status: "Research",
    statusKey: "research",
    title: "EDEN",
    sub: "AI civilisation simulation",
    body: "Multi-agent civilisation simulator powered by Claude. Explores emergent behaviour, decision systems and AI-driven world state at scale.",
    tags: ["Claude API", "Multi-agent", "Python"],
    featured: false,
  },
  {
    id: "acl-bot",
    status: "Deployed",
    statusKey: "deployed",
    title: "ACL Bot",
    sub: "Discord community tooling",
    body: "Full-featured Discord bot for football league operations. Availability scheduling, stat tracking, lineup builder and AI session summaries.",
    tags: ["Python", "discord.py", "Supabase"],
    featured: false,
  },
];

const systems = [
  { name: "atheus.dev", status: "live" as const },
  { name: "League Platform", status: "live" as const },
  { name: "ACL Bot", status: "live" as const },
  { name: "EDEN", status: "active" as const },
];

export default function Home() {
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

      <section className="ai-hero">
        <div className="ai-hero-copy">
          <p className="ai-status-pill">
            <i aria-hidden="true" />
            Systems engineering studio
          </p>
          <h1>
            Atheus<br />
            Industries
          </h1>
          <p className="ai-hero-lead">
            Engineering intelligent systems across web, AI and robotics.
            An early-stage technology studio building websites, automation
            tools, AI pipelines and hardware prototypes.
          </p>
          <div className="ai-hero-actions">
            <Link className="ai-btn ai-btn-primary" href="/projects">
              View projects
            </Link>
            <Link className="ai-btn ai-btn-ghost" href="/services">
              Our services
            </Link>
          </div>
        </div>

        <div className="ai-systems-panel" aria-label="Live systems status">
          <div className="ai-panel-bar">
            <span className="ai-panel-dots" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="ai-panel-label">ATHEUS &middot; SYSTEMS STATUS</span>
          </div>
          <ul className="ai-panel-list">
            {systems.map((s) => (
              <li key={s.name} className="ai-panel-row">
                <span className="ai-panel-name">{s.name}</span>
                <span className={`ai-panel-status is-${s.status}`}>
                  <i aria-hidden="true" />
                  {s.status === "live" ? "LIVE" : "ACTIVE"}
                </span>
              </li>
            ))}
          </ul>
          <div className="ai-panel-footer">
            <span>4 systems operational</span>
            <span>Est. 2025</span>
          </div>
        </div>
      </section>

      <section className="ai-services-section" id="services">
        <div className="ai-section-inner">
          <div className="ai-section-head">
            <span className="ai-kicker">What we build</span>
            <h2>Services</h2>
          </div>
          <div className="ai-services-list">
            {services.map((svc) => (
              <div className="ai-service-row" key={svc.n}>
                <span className="ai-service-n">{svc.n}</span>
                <h3>{svc.title}</h3>
                <p>{svc.body}</p>
              </div>
            ))}
          </div>
          <div className="ai-section-action">
            <Link className="ai-btn ai-btn-outline" href="/services">
              Full services
            </Link>
          </div>
        </div>
      </section>

      <section className="ai-projects-section" id="projects">
        <div className="ai-section-inner">
          <div className="ai-section-head">
            <span className="ai-kicker">Selected work</span>
            <h2>Projects</h2>
          </div>
          <div className="ai-projects-grid">
            {projects.filter((p) => p.featured).map((p) => (
              <article className="ai-project-card ai-project-featured" key={p.id}>
                <span className={`ai-project-status is-${p.statusKey}`}>{p.status}</span>
                <h3>{p.title}</h3>
                <p className="ai-project-sub">{p.sub}</p>
                <p className="ai-project-body">{p.body}</p>
                <footer>
                  {p.tags.map((t) => (
                    <span className="ai-tag" key={t}>{t}</span>
                  ))}
                </footer>
              </article>
            ))}
            <div className="ai-projects-secondary">
              {projects.filter((p) => !p.featured).map((p) => (
                <article className="ai-project-card" key={p.id}>
                  <span className={`ai-project-status is-${p.statusKey}`}>{p.status}</span>
                  <h3>{p.title}</h3>
                  <p className="ai-project-sub">{p.sub}</p>
                  <p className="ai-project-body">{p.body}</p>
                  <footer>
                    {p.tags.map((t) => (
                      <span className="ai-tag" key={t}>{t}</span>
                    ))}
                  </footer>
                </article>
              ))}
            </div>
          </div>
          <div className="ai-section-action">
            <Link className="ai-btn ai-btn-outline" href="/projects">
              All projects
            </Link>
          </div>
        </div>
      </section>

      <section className="ai-about-strip">
        <div className="ai-section-inner">
          <div className="ai-about-inner">
            <div className="ai-about-copy">
              <span className="ai-kicker">About</span>
              <h2>We build things that work.</h2>
              <p>
                Atheus Industries is an early-stage technology studio founded by Evan, a
                developer building across web, AI and hardware. The work here is real:
                deployed systems, active experiments and genuine prototypes. No inflated
                claims, no fake case studies.
              </p>
              <Link className="ai-btn ai-btn-outline" href="/about">
                About us
              </Link>
            </div>
            <div className="ai-about-rule" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="ai-cta-section" id="contact">
        <div className="ai-section-inner">
          <div className="ai-cta-inner">
            <span className="ai-kicker">Get in touch</span>
            <h2>Building something? Let&apos;s talk.</h2>
            <p>
              Available for custom builds, consultations and collaborations.
              Website projects, AI tooling, Discord bots and hardware prototyping.
            </p>
            <Link className="ai-btn ai-btn-primary" href="/contact">
              Contact us
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

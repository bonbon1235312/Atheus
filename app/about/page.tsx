import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Atheus Industries is an early-stage technology studio building across web, AI and hardware. Founded by Evan Nicholson in 2025.",
};

export default function About() {
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
          <span className="ai-kicker">About</span>
          <h1>Atheus Industries</h1>
          <p>
            An early-stage technology studio building real systems across web, AI and hardware.
            Founded in 2025.
          </p>
        </div>
      </section>

      <section>
        <div className="ai-section-inner">
          <div className="ai-two-col">
            <div className="ai-content-block">
              <span className="ai-kicker">The studio</span>
              <h2>What we are</h2>
              <p>
                Atheus Industries is a technology studio founded by Evan Nicholson. We
                build websites, automation systems, AI tools and hardware prototypes, with
                a focus on real deployed solutions rather than theoretical concepts.
              </p>
              <p>
                The studio is early-stage and building in the open. Work spans multiple
                disciplines: web development with frameworks like Next.js, AI automation
                using Claude and other LLMs, Discord community tooling, and embedded
                hardware with ESP32 platforms.
              </p>
              <p>
                Every project in the portfolio is real — deployed, active or in genuine
                development. No inflated case studies, no fake clients.
              </p>
            </div>

            <div className="ai-content-block">
              <span className="ai-kicker">The approach</span>
              <h2>How we work</h2>
              <p>
                We prototype quickly, deploy early and iterate in production. Good
                engineering is practical: a system that ships and works is worth more than
                a perfect system that never leaves the planning stage.
              </p>
              <p>
                Scope is kept tight. We work on one thing properly rather than five things
                partially. When a project is ready, it gets documented honestly — including
                what worked and what didn&apos;t.
              </p>
              <p>
                We&apos;re particularly interested in the overlap between software systems
                and physical hardware, and in how AI agents can augment or automate
                real-world workflows without replacing human judgment.
              </p>
            </div>
          </div>

          <div className="ai-content-block" style={{ marginTop: "80px" }}>
            <span className="ai-kicker">Background</span>
            <h2>Where it started</h2>
            <p>
              Atheus started as a Discord EA FC league management platform — a fully
              deployed multi-tenant SaaS with automated match detection, live statistics,
              and subdomain routing. That platform is still live and serves as the
              foundation of the engineering practices at the studio.
            </p>
            <p>
              From that foundation, the scope expanded: AI automation tooling, Discord bots
              for other communities, hardware experiments with ESP32 microcontrollers, and
              research into multi-agent AI simulation. Atheus Industries is the umbrella
              for all of it.
            </p>
          </div>
        </div>
      </section>

      <section className="ai-cta-section">
        <div className="ai-section-inner">
          <div className="ai-cta-inner">
            <span className="ai-kicker">Work with us</span>
            <h2>Building something?</h2>
            <p>
              We take on custom projects: websites, automation systems, Discord tooling,
              AI pipelines and hardware prototypes.
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

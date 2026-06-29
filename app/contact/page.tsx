import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Atheus Industries. We take on custom web, AI, Discord and hardware projects.",
};

export default function Contact() {
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
          <span className="ai-kicker">Get in touch</span>
          <h1>Contact</h1>
          <p>
            We take on custom projects across web, AI and hardware. Drop us a message
            and we&apos;ll respond within a day or two.
          </p>
        </div>
      </section>

      <section>
        <div className="ai-section-inner">
          <div className="ai-contact-block">
            <div>
              <p className="ai-contact-lead">
                Send a brief description of what you&apos;re working on, what you need,
                and any relevant constraints (timeline, budget, technology preferences).
                We&apos;ll be straightforward about what&apos;s realistic.
              </p>

              <p className="ai-contact-lead" style={{ marginTop: 0 }}>
                We work on websites and web applications, AI automation systems, Discord
                bots, software integrations, technical prototypes, and hardware projects.
                If you&apos;re unsure whether it fits, ask anyway.
              </p>

              <Link
                className="ai-btn ai-btn-primary"
                href="mailto:nicholsone140@gmail.com"
              >
                nicholsone140@gmail.com
              </Link>
            </div>

            <div className="ai-contact-meta">
              <div className="ai-contact-item">
                <span>Email</span>
                <a href="mailto:nicholsone140@gmail.com">nicholsone140@gmail.com</a>
              </div>

              <div className="ai-contact-item">
                <span>Response time</span>
                <p>Usually within 24-48 hours</p>
              </div>

              <div className="ai-contact-item">
                <span>What to include</span>
                <p>What you need, rough timeline, any budget constraints</p>
              </div>

              <div className="ai-contact-item">
                <span>Platform support</span>
                <p>
                  For help with the Atheus League Platform, log in at{" "}
                  <Link href="/admin">atheus.dev/admin</Link> or contact us directly.
                </p>
              </div>
            </div>
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

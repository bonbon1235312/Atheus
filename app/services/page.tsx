import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web design and development, AI automation systems, Discord bots, robotics and hardware prototyping. Atheus Industries builds across the full stack.",
};

const services = [
  {
    n: "01",
    title: "Web Design & Development",
    summary: "Full-stack websites and web applications.",
    detail:
      "From simple landing pages to complex multi-tenant platforms. Built with modern frameworks — primarily Next.js, React, TypeScript — with attention to performance, accessibility and long-term maintainability. Database design with PostgreSQL and Supabase. Auth integration, subdomain routing, server actions, API routes.",
    tags: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL"],
  },
  {
    n: "02",
    title: "AI Automation Systems",
    summary: "Intelligent pipelines using LLMs and APIs.",
    detail:
      "Custom automation agents using Claude, OpenAI and similar LLMs. Data extraction and processing pipelines, AI-assisted decision flows, automated content workflows. Systems designed to reduce manual overhead while keeping humans in the loop on anything that matters.",
    tags: ["Claude API", "LLM pipelines", "Python", "Automation"],
  },
  {
    n: "03",
    title: "Discord Bots & Software Automation",
    summary: "Bots, integrations and automated workflows.",
    detail:
      "Discord bots built with discord.py — from simple utility commands to full community management systems with persistent data, interactive views, scheduled tasks and AI integration. Cross-platform integrations with Supabase, external APIs and webhook systems.",
    tags: ["discord.py", "Python", "Webhooks", "Supabase"],
  },
  {
    n: "04",
    title: "Robotics & Embedded Systems",
    summary: "Physical computing with ESP32 and Arduino platforms.",
    detail:
      "Hardware prototypes that bridge software and the physical world. Temperature and environmental monitoring, automated fan control, sensor networks, actuator systems. Firmware development in C++ and MicroPython. Designed for reliability and real-world deployment.",
    tags: ["ESP32", "Arduino", "C++", "MicroPython", "Sensors"],
  },
  {
    n: "05",
    title: "Technical Prototyping",
    summary: "Fast, honest proof-of-concept development.",
    detail:
      "Early-stage exploration of new ideas. The goal: a working prototype that honestly demonstrates whether the idea is viable, built quickly and without over-engineering. Good for validating a technical approach before committing to a full build.",
    tags: ["Rapid prototyping", "Feasibility", "Cross-platform"],
  },
];

export default function Services() {
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
          <span className="ai-kicker">What we build</span>
          <h1>Services</h1>
          <p>
            Five core areas. All involving real deployed work, not just tools we&apos;ve
            read about.
          </p>
        </div>
      </section>

      <section className="ai-services-section">
        <div className="ai-section-inner">
          <div className="ai-services-list">
            {services.map((svc) => (
              <div className="ai-service-row ai-service-row-detail" key={svc.n}>
                <span className="ai-service-n">{svc.n}</span>
                <div>
                  <h3>{svc.title}</h3>
                  <p className="ai-service-summary">{svc.summary}</p>
                </div>
                <div>
                  <p>{svc.detail}</p>
                  <div className="ai-tag-row">
                    {svc.tags.map((t) => (
                      <span className="ai-tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-cta-section">
        <div className="ai-section-inner">
          <div className="ai-cta-inner">
            <span className="ai-kicker">Start a project</span>
            <h2>Ready to build?</h2>
            <p>
              Tell us what you&apos;re working on. We&apos;ll be straightforward about
              what&apos;s realistic and what it involves.
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

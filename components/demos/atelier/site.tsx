import Image from "next/image";
import Link from "next/link";

import { DemoBadge } from "@/components/demos/demo-badge";

import "@/components/demos/demo-badge.css";
import "./atelier.css";

const services = [
  {
    title: "Brand Strategy",
    body: "Positioning, messaging, and identity systems that scale.",
    icon: "◇",
  },
  {
    title: "Web Design",
    body: "High-converting interfaces with intentional motion.",
    icon: "▣",
  },
  {
    title: "Web Development",
    body: "Production-ready builds engineered for performance.",
    icon: "</>",
  },
  {
    title: "Ongoing Support",
    body: "Retainer partnership for iteration and launches.",
    icon: "↺",
  },
];

const pricing = [
  { name: "Starter", price: "$6,000" },
  { name: "Growth", price: "$12,000" },
  { name: "Enterprise", price: "Custom" },
];

const trusted = ["Nomadic", "Verdant", "Husk", "Cora", "Lumen", "Obsidian"];

export function AtelierSite() {
  return (
    <div className="at-root">
      <div className="at-grain" aria-hidden="true" />
      <DemoBadge brand="Atelier" />

      <header className="at-nav">
        <Link className="at-brand" href="#top">
          Atelier
        </Link>
        <nav aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#pricing">Pricing</a>
          <a href="#journal">Journal</a>
        </nav>
        <a className="at-btn" href="#contact">
          Book a call
        </a>
      </header>

      <main id="top">
        <section className="at-hero">
          <div className="at-hero-copy">
            <h1>
              Strategic design.
              <br />
              Real business impact.
            </h1>
            <p>
              We partner with ambitious brands to craft digital experiences that convert —
              combining sharp strategy with meticulous execution.
            </p>
            <div className="at-hero-actions">
              <a className="at-btn" href="#work">
                View our work
              </a>
              <a className="at-btn at-btn-ghost" href="#contact">
                Book a call
              </a>
            </div>
          </div>
          <div className="at-hero-media">
            <Image
              src="/brand/atelier-hero.jpg"
              alt="Ceramic torus vase and granite stone on dark marble"
              width={1200}
              height={1500}
              priority
              sizes="(max-width: 960px) 100vw, 42vw"
            />
          </div>
        </section>

        <section className="at-trust">
          <div className="at-wrap at-trust-row">
            <p>Trusted by ambitious brands</p>
            <ul>
              {trusted.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="at-section at-capabilities" id="services">
          <div className="at-wrap at-services">
            <div className="at-services-intro">
              <p className="at-kicker">Services</p>
              <h2>Capabilities built around your goals.</h2>
              <a className="at-text-link" href="#services">
                Explore services →
              </a>
            </div>

            <ul className="at-service-list">
              {services.map((service) => (
                <li key={service.title}>
                  <span className="at-service-icon" aria-hidden="true">
                    {service.icon}
                  </span>
                  <div>
                    <strong>{service.title}</strong>
                    <p>{service.body}</p>
                  </div>
                  <span className="at-plus" aria-hidden="true">
                    +
                  </span>
                </li>
              ))}
            </ul>

            <div className="at-pricing-panel" id="pricing">
              <p className="at-kicker">Pricing</p>
              <h3>Simple, transparent pricing.</h3>
              <ul>
                {pricing.map((tier) => (
                  <li key={tier.name}>
                    <strong>{tier.name}</strong>
                    <em>{tier.price}</em>
                    <span className="at-plus" aria-hidden="true">
                      +
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="at-section" id="work">
          <div className="at-wrap">
            <p className="at-kicker">Work</p>
            <h2 className="at-work-title">Selected engagements.</h2>
            <div className="at-work-grid">
              <article>
                <div className="at-work-frame">
                  <Image
                    src="/brand/sites-product.png"
                    alt=""
                    width={1000}
                    height={700}
                  />
                </div>
                <h3>Veridium relaunch</h3>
                <p>Brand system and marketing site</p>
              </article>
              <article>
                <div className="at-work-frame">
                  <Image
                    src="/brand/sites-showcase-1.jpg"
                    alt=""
                    width={1000}
                    height={700}
                  />
                </div>
                <h3>Lumenix product UI</h3>
                <p>Design system and onboarding</p>
              </article>
            </div>
          </div>
        </section>

        <section className="at-section at-about" id="about">
          <div className="at-wrap at-about-grid">
            <div>
              <p className="at-kicker">About</p>
              <h2>A studio that designs for outcomes.</h2>
            </div>
            <p>
              We keep teams small, critiques sharp, and delivery close to the brief. The
              goal is not more screens — it is a clearer business presence.
            </p>
          </div>
        </section>

        <section className="at-section" id="journal">
          <div className="at-wrap">
            <p className="at-kicker">Journal</p>
            <h2 className="at-work-title">Notes from the studio.</h2>
            <div className="at-journal">
              <article>
                <strong>Why restraint converts better</strong>
                <p>Fewer competing signals. Stronger decisions on the page.</p>
              </article>
              <article>
                <strong>Pricing as a design surface</strong>
                <p>Clarity beats clever packaging when money is involved.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="at-section" id="contact">
          <div className="at-wrap at-contact">
            <h2>Tell us what you need to look like.</h2>
            <a className="at-btn" href="mailto:hello@atelier.example">
              Book a call
            </a>
          </div>
        </section>
      </main>

      <footer className="at-footer">
        <div className="at-wrap">
          <span>Atelier</span>
          <span>Demo website for Atheus Sites</span>
        </div>
      </footer>
    </div>
  );
}

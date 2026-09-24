import Image from "next/image";
import Link from "next/link";

import { DemoBadge } from "@/components/demos/demo-badge";
import { DemoIntro } from "@/components/demos/demo-intro";
import { QuoteForm } from "@/components/demos/northline/quote-form";
import { ServiceSelector } from "@/components/demos/northline/service-selector";

import "@/components/demos/demo-badge.css";
import "./northline.css";

export function NorthlineSite() {
  return (
    <div className="nl-root">
      <DemoBadge brand="Northline Electrical" />
      <DemoIntro brand="northline" />

      <header className="nl-nav">
        <Link className="nl-brand" href="#top">
          Northline
        </Link>
        <nav aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#quote">Quote</a>
          <a href="#trust">Trust</a>
        </nav>
        <a className="nl-btn" href="#quote">
          Request a quote
        </a>
      </header>

      <main id="top">
        <section className="nl-hero">
          <div className="nl-hero-grid">
            <div className="nl-hero-copy">
              <p className="nl-hero-kicker">Commercial / Domestic / Emergency</p>
              <h1>Northline Electrical</h1>
              <p>
                Commercial and domestic contractor for Manchester and the North
                West.
              </p>
              <a className="nl-btn" href="#quote">
                Request a quote
              </a>
            </div>
            <div className="nl-hero-emergency">
              <p><span className="nl-live-dot" aria-hidden="true" />24/7 emergency</p>
              <a href="tel:+441618334410">0161 833 4410</a>
              <span>Call-out across Greater Manchester</span>
            </div>
          </div>
          <div className="nl-hero-band">
            <Image
              src="/brand/northline-hero.jpg"
              alt="Bright commercial ceiling with LED panels and cable tray"
              width={1920}
              height={1080}
              priority
              sizes="100vw"
            />
            <span className="nl-hero-band-caption">Electrical work for the North West <span>↗</span></span>
          </div>
        </section>

        <section className="nl-section" id="services">
          <div className="nl-wrap">
            <h2 data-demo-reveal>Pick a service</h2>
            <ServiceSelector />
          </div>
        </section>

        <section className="nl-section nl-quote-section" id="quote">
          <div className="nl-wrap nl-quote-layout">
            <div>
              <h2 data-demo-reveal>Request a quote</h2>
              <p>
                Tell us the work, the building, and the timing. We reply within
                one working day.
              </p>
            </div>
            <QuoteForm />
          </div>
        </section>

        <section className="nl-section" id="trust">
          <div className="nl-wrap">
            <h2 data-demo-reveal>Registered and on call</h2>
            <div className="nl-trust">
              <div className="nl-badges">
                <span className="nl-badge">NICEIC</span>
                <span className="nl-badge">NAPIT</span>
              </div>
              <p>
                Approved Contractor. Part P for dwellings. Emergency 24/7
                call-out on{" "}
                <a href="tel:+441618334410">0161 833 4410</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="nl-footer">
        <div className="nl-wrap">
          <div>
            <strong>Northline Electrical</strong>
            <p>
              Unit 7, Trafford Park Road
              <br />
              Manchester, M17 1AN
            </p>
          </div>
          <p>Demo website for Atheus Sites</p>
        </div>
      </footer>
    </div>
  );
}

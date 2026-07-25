import Image from "next/image";
import Link from "next/link";

import { DemoBadge } from "@/components/demos/demo-badge";

import "@/components/demos/demo-badge.css";
import "./hearth.css";

const menu = [
  { name: "House Espresso", detail: "Chocolate · hazelnut · long finish", price: "£3.40" },
  { name: "Oat Flat White", detail: "Silky, balanced, everyday favourite", price: "£3.80" },
  { name: "Batch Brew", detail: "Rotating single origin", price: "£3.20" },
  { name: "Seasonal Pour Over", detail: "Ask for today's roast", price: "£4.20" },
];

export function HearthCoSite() {
  return (
    <div className="hc-root">
      <DemoBadge brand="Hearth & Co" />

      <header className="hc-nav">
        <Link className="hc-brand" href="#top">
          Hearth &amp; Co
        </Link>
        <nav aria-label="Primary">
          <a href="#menu">Menu</a>
          <a href="#about">About</a>
          <a href="#journal">Journal</a>
          <a href="#visit">Location</a>
          <a href="#visit">Hours</a>
        </nav>
        <a className="hc-nav-cta" href="#menu">
          Order Ahead
        </a>
      </header>

      <main id="top">
        <section className="hc-hero">
          <Image
            className="hc-hero-image"
            src="/brand/hearth-hero.jpg"
            alt="Warm cafe interior with soft pendant light"
            fill
            priority
            sizes="100vw"
          />
          <div className="hc-hero-veil" />
          <div className="hc-hero-copy">
            <h1>Coffee worth the walk.</h1>
            <p>
              Thoughtfully sourced beans, expertly brewed, and served in a space that
              feels like home.
            </p>
            <a className="hc-btn" href="#menu">
              View Menu <span aria-hidden="true">→</span>
            </a>
          </div>
          <ul className="hc-hero-bar">
            <li>Quality Ingredients</li>
            <li>Expertly Brewed</li>
            <li>Local &amp; Independent</li>
            <li>Community Focused</li>
          </ul>
        </section>

        <section className="hc-section" id="menu">
          <div className="hc-wrap hc-split">
            <div>
              <p className="hc-kicker">Menu</p>
              <h2>Brewed for slow mornings and sharp afternoons.</h2>
            </div>
            <ul className="hc-menu">
              {menu.map((item) => (
                <li key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <em>{item.price}</em>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="hc-section hc-about" id="about">
          <div className="hc-wrap hc-about-grid">
            <div className="hc-about-media">
              <Image
                src="/brand/hearth-about.jpg"
                alt="Freshly pulled espresso in a ceramic cup"
                width={900}
                height={1100}
              />
            </div>
            <div>
              <p className="hc-kicker">About</p>
              <h2>A neighbourhood room with city standards.</h2>
              <p>
                Hearth &amp; Co started as a morning ritual and became a place people
                stay. We roast light for clarity, milk drinks for balance, and keep the
                room quiet enough to think.
              </p>
            </div>
          </div>
        </section>

        <section className="hc-section" id="journal">
          <div className="hc-wrap">
            <p className="hc-kicker">Journal</p>
            <h2 className="hc-journal-title">Notes from the bar</h2>
            <div className="hc-journal-grid">
              <article>
                <strong>Why we switched origins this month</strong>
                <p>A brighter Colombia lot for pour overs, and a steadier house espresso.</p>
              </article>
              <article>
                <strong>Weekend pastry rotation</strong>
                <p>Almond croissant returns on Saturdays. Cardamom bun stays all week.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="hc-section hc-visit" id="visit">
          <div className="hc-wrap hc-visit-grid">
            <div>
              <p className="hc-kicker">Visit</p>
              <h2>Find us on the corner.</h2>
              <p>14 Grove Street · Open daily 7:30–16:00</p>
            </div>
            <a className="hc-btn" href="mailto:hello@hearthandco.example">
              Say hello <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="hc-footer">
        <div className="hc-wrap">
          <span>Hearth &amp; Co</span>
          <span>Demo website for Atheus Sites</span>
        </div>
      </footer>
    </div>
  );
}

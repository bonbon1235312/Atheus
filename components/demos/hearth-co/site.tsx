import Image from "next/image";
import Link from "next/link";

import { DemoBadge } from "@/components/demos/demo-badge";
import { DemoIntro } from "@/components/demos/demo-intro";
import { MenuBoard } from "@/components/demos/hearth-co/menu-board";
import { TableBooking } from "@/components/demos/hearth-co/table-booking";

import "@/components/demos/demo-badge.css";
import "./hearth.css";

export function HearthCoSite() {
  return (
    <div className="hc-root">
      <DemoBadge brand="Hearth & Co" />
      <DemoIntro brand="hearth" />

      <header className="hc-nav">
        <Link className="hc-brand" href="#top">
          Hearth &amp; Co
        </Link>
        <nav aria-label="Primary">
          <a href="#menu">Menu</a>
          <a href="#book">Book</a>
          <a href="#about">About</a>
          <a href="#visit">Visit</a>
        </nav>
        <a className="hc-nav-cta" href="#book">
          Book a table
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
              Thoughtfully sourced beans, expertly brewed, in a room that feels
              like home.
            </p>
            <a className="hc-btn" href="#menu">
              View menu
            </a>
          </div>
          <ul className="hc-hero-bar">
            <li>Open daily 7:30-16:00</li>
            <li>Colombia this month</li>
            <li>House espresso</li>
            <li>14 Grove Street</li>
          </ul>
        </section>

        <section className="hc-section" id="menu">
          <div className="hc-wrap">
            <h2 data-demo-reveal>Menu</h2>
            <p className="hc-lead">
              Coffee, food, and pastry. Filter it while you wait.
            </p>
            <MenuBoard />
          </div>
        </section>

        <section className="hc-section hc-book-section" id="book">
          <div className="hc-wrap">
            <h2 data-demo-reveal>Book a table</h2>
            <p className="hc-lead">
              Pick a day, a party size, and a time. We hold it until you arrive.
            </p>
            <TableBooking />
          </div>
        </section>

        <section className="hc-section hc-about" id="about">
          <div className="hc-wrap hc-about-grid">
            <div className="hc-about-media" data-demo-reveal>
              <Image
                src="/brand/hearth-about.jpg"
                alt="Freshly pulled espresso in a ceramic cup"
                width={900}
                height={1100}
              />
            </div>
            <div>
              <h2 data-demo-reveal>A neighbourhood room with city standards.</h2>
              <p>
                Hearth &amp; Co started as a morning ritual and became a place
                people stay. We roast light for clarity, milk drinks for
                balance, and keep the room quiet enough to think.
              </p>
            </div>
          </div>
        </section>

        <section className="hc-section hc-visit" id="visit">
          <div className="hc-wrap">
            <h2 data-demo-reveal>14 Grove Street</h2>
            <p>Open daily 7:30-16:00. Last seating 14:30.</p>
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

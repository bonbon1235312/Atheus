import Image from "next/image";
import Link from "next/link";

import { DemoBadge } from "@/components/demos/demo-badge";

import "@/components/demos/demo-badge.css";
import "./rivermark.css";

const projects = [
  {
    title: "North Quay Residence",
    meta: "Residential · 2025",
    image: "/brand/rivermark-project-1.jpg",
  },
  {
    title: "Ashline Pavilion",
    meta: "Cultural · 2024",
    image: "/brand/rivermark-project-2.jpg",
  },
  {
    title: "Harbour House",
    meta: "Interiors · 2024",
    image: "/brand/rivermark-project-3.jpg",
  },
];

export function RivermarkSite() {
  return (
    <div className="rm-root">
      <DemoBadge brand="Rivermark Studio" />

      <header className="rm-nav">
        <Link className="rm-brand" href="#top">
          Rivermark Studio
        </Link>
        <nav aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#studio">Studio</a>
          <a href="#approach">Approach</a>
          <a href="#journal">Journal</a>
        </nav>
        <a className="rm-btn" href="#contact">
          Contact
        </a>
      </header>

      <main id="top">
        <section className="rm-hero">
          <div className="rm-hero-copy">
            <p className="rm-kicker">Architecture · Interiors · Landscape</p>
            <h1>
              Spaces that earn silence<span>.</span>
            </h1>
            <p>
              Rivermark designs buildings and interiors with restraint, material honesty,
              and a calm presence in the city.
            </p>
            <a className="rm-btn" href="#work">
              View our work <span aria-hidden="true">→</span>
            </a>
            <div className="rm-journal-teaser" id="journal">
              <span>Latest journal</span>
              <strong>Light as a structural material</strong>
            </div>
          </div>
          <div className="rm-hero-media">
            <Image
              src="/brand/rivermark-hero.jpg"
              alt="Modern concrete architecture at dusk"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </div>
        </section>

        <section className="rm-section" id="work">
          <div className="rm-wrap">
            <div className="rm-section-head">
              <p className="rm-kicker">Selected work</p>
              <h2>Projects with gravity.</h2>
            </div>
            <div className="rm-work-grid">
              {projects.map((project) => (
                <article key={project.title}>
                  <div className="rm-work-media">
                    <Image
                      src={project.image}
                      alt=""
                      width={1200}
                      height={900}
                      sizes="(max-width: 900px) 100vw, 33vw"
                    />
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.meta}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rm-section rm-studio" id="studio">
          <div className="rm-wrap rm-studio-grid">
            <div>
              <p className="rm-kicker">Studio</p>
              <h2>A practice built around listening.</h2>
            </div>
            <p>
              We work with private clients and cultural institutions who want architecture
              that feels inevitable in place — not louder than it needs to be.
            </p>
          </div>
        </section>

        <section className="rm-section" id="approach">
          <div className="rm-wrap rm-approach">
            <article>
              <strong>01</strong>
              <h3>Context first</h3>
              <p>Every project begins with site, light, and how people already move.</p>
            </article>
            <article>
              <strong>02</strong>
              <h3>Material honesty</h3>
              <p>Concrete, timber, stone, and metal used for what they do best.</p>
            </article>
            <article>
              <strong>03</strong>
              <h3>Quiet detail</h3>
              <p>Thresholds, junctions, and daylight do the expressive work.</p>
            </article>
          </div>
        </section>

        <section className="rm-section rm-contact" id="contact">
          <div className="rm-wrap rm-contact-row">
            <div>
              <p className="rm-kicker">Contact</p>
              <h2>Start a conversation.</h2>
              <p>New commissions and collaborations: studio@rivermark.example</p>
            </div>
            <a className="rm-btn" href="mailto:studio@rivermark.example">
              Email the studio
            </a>
          </div>
        </section>
      </main>

      <footer className="rm-footer">
        <div className="rm-wrap">
          <span>Rivermark Studio</span>
          <span>Demo website for Atheus Sites</span>
        </div>
      </footer>
    </div>
  );
}

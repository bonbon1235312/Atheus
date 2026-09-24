import Image from "next/image";
import Link from "next/link";

import { DemoBadge } from "@/components/demos/demo-badge";
import { DemoIntro } from "@/components/demos/demo-intro";

import "@/components/demos/demo-badge.css";
import "./ridgeway.css";

const capabilities = [
  { number: "01", title: "Civil engineering", description: "Highways, drainage and structures for public and private clients. We manage the programme from first scrape to handover.", image: "/brand/ridgeway-steel.jpg", alt: "Reinforcement cages and structural steel on site" },
  { number: "02", title: "Earthworks", description: "Bulk excavation, cut and fill, muckaway and formation for roads and plots.", image: "/brand/ridgeway-earthworks.jpg", alt: "Dump trucks working on an earthworks haul road" },
  { number: "03", title: "Concrete", description: "Slabs, abutments and reinforced works, with our own plant and site crews on the ground.", image: "/brand/ridgeway-concrete.jpg", alt: "Concrete pump and formwork during a structural pour" },
] as const;

const projects = [
  { name: "A14 Junction 13", scope: "Highways / drainage", year: "2025", description: "Earthworks and drainage through a live traffic programme.", image: "/brand/ridgeway-project-highway.jpg", alt: "Highway junction earthworks with plant on haul roads" },
  { name: "Corby Logistics Park", scope: "Groundworks / slabs", year: "2025", description: "Groundworks, slab and drainage for a distribution unit.", image: "/brand/ridgeway-project-frame.jpg", alt: "Concrete slab and steel portal frame under construction" },
  { name: "Welland Flood Works", scope: "Reinforced concrete", year: "2024", description: "Reinforced walls and channel lining for a flood defence scheme.", image: "/brand/rivermark-hero.jpg", alt: "Completed reinforced concrete structure at dusk" },
] as const;

export function RidgewaySite() {
  return (
    <div className="rw-root">
      <DemoBadge brand="Ridgeway Civils" />
      <DemoIntro brand="ridgeway" />

      <header className="rw-nav">
        <Link className="rw-brand" href="#top">Ridgeway Civils</Link>
        <nav aria-label="Primary"><a href="#capabilities">Capabilities</a><a href="#projects">Projects</a><a href="#yard">Contact</a></nav>
        <a className="rw-nav-phone" href="tel:+441536401220">01536 401 220</a>
      </header>

      <main id="top">
        <section className="rw-hero" aria-labelledby="rw-hero-title">
          <div className="rw-hero-media">
            <Image src="/brand/ridgeway-hero.jpg" alt="Yellow excavator working a cut-and-fill earthworks site" fill priority sizes="100vw" />
            <span className="rw-photo-note">Earthworks / East Midlands</span>
          </div>
          <div className="rw-wrap rw-hero-copy">
            <div><p className="rw-eyebrow">Corby, Northamptonshire / East Midlands</p><h1 id="rw-hero-title">Groundworks.<br />Highways.<br />Concrete.</h1></div>
            <div className="rw-hero-aside">
              <p>Practical civil engineering across the East Midlands. Experienced crews, our own plant, and a clear plan for the work on site.</p>
              <div className="rw-hero-actions"><a className="rw-btn" href="#yard">Send a tender enquiry</a><a className="rw-text-link" href="tel:+441536401220">Call the yard ↗</a></div>
            </div>
          </div>
        </section>

        <section className="rw-accredit" aria-label="Accreditations"><div className="rw-wrap rw-accredit-inner"><span>Accreditations</span><div><span>CHAS</span><span>ISO 9001</span><span>ISO 45001</span><span>Constructionline Gold</span></div></div></section>

        <section className="rw-section" id="capabilities" aria-labelledby="rw-capabilities-title">
          <div className="rw-wrap">
            <div className="rw-section-heading"><p className="rw-eyebrow">01 / What we do</p><h2 id="rw-capabilities-title">Capabilities</h2><p>We price, plan and deliver the core site works that keep a programme moving.</p></div>
            <div className="rw-cap-list">{capabilities.map((item) => (
              <article className="rw-cap" key={item.number}>
                <span className="rw-row-number">{item.number}</span>
                <div className="rw-cap-copy"><h3>{item.title}</h3><p>{item.description}</p></div>
                <div className="rw-cap-media"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 800px) 100vw, 32vw" /></div>
              </article>
            ))}</div>
          </div>
        </section>

        <section className="rw-section rw-projects" id="projects" aria-labelledby="rw-projects-title">
          <div className="rw-wrap">
            <div className="rw-section-heading"><p className="rw-eyebrow">02 / Selected work</p><h2 id="rw-projects-title">Recent projects</h2><p>A sample of highways, commercial and structural work.</p></div>
            <div className="rw-project-list">{projects.map((project) => (
              <article className="rw-project" key={project.name}>
                <div className="rw-project-media"><Image src={project.image} alt={project.alt} fill sizes="(max-width: 800px) 100vw, 60vw" /></div>
                <div className="rw-project-copy"><span>{project.scope} / {project.year}</span><h3>{project.name}</h3><p>{project.description}</p></div>
              </article>
            ))}</div>
          </div>
        </section>

        <section className="rw-yard" id="yard" aria-labelledby="rw-yard-title">
          <div className="rw-wrap rw-yard-grid">
            <div><p className="rw-eyebrow">03 / Get in touch</p><h2 id="rw-yard-title">Talk to the yard.</h2><p>Tenders, plant and site queries. Weekdays 07:00–17:00.</p><a className="rw-btn" href="mailto:tenders@ridgewaycivils.example">Send tender details</a></div>
            <dl className="rw-facts">
              <div><dt>Telephone</dt><dd><a href="tel:+441536401220">01536 401 220</a></dd></div>
              <div><dt>Email</dt><dd><a href="mailto:tenders@ridgewaycivils.example">tenders@ridgewaycivils.example</a></dd></div>
              <div><dt>Address</dt><dd>12 Mill Lane<br />Weldon, Corby<br />NN17 3JG</dd></div>
            </dl>
          </div>
        </section>
      </main>

      <footer className="rw-footer"><div className="rw-wrap"><span>Ridgeway Civils</span><span>Demo website for Atheus Sites</span></div></footer>
    </div>
  );
}

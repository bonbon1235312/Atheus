import Image from "next/image";
import Link from "next/link";

import { HomeHero } from "@/components/marketing/home-hero";
import { AgencyLoader } from "@/components/marketing/agency-loader";
import { AgencyMotion } from "@/components/marketing/agency-motion";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { StructuredData } from "@/components/marketing/structured-data";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_ORIGIN, marketingMetadata } from "@/lib/seo";
import { selectedWork } from "@/lib/work";

export const metadata = marketingMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" });

const studioSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#organization`,
      name: "Atheus",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/favicon.svg`,
      email: "hello@atheus.dev",
      description: HOME_DESCRIPTION,
      areaServed: { "@type": "Country", name: "United Kingdom" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      name: "Atheus",
      alternateName: "Atheus Studio",
      url: `${SITE_ORIGIN}/`,
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
      inLanguage: "en-GB",
    },
  ],
};

const services = [
  { number: "01", title: "Design", detail: "Strategy, art direction and interfaces shaped around your audience." },
  { number: "02", title: "Development", detail: "Responsive websites, purposeful motion and care in the details." },
  { number: "03", title: "Digital products", detail: "Custom software that connects useful interfaces to the systems behind them." },
] as const;

export default function Home() {
  return (
    <MarketingShell variant="agency">
      <StructuredData data={studioSchema} />
      <AgencyLoader />
      <AgencyMotion />
      <HomeHero />

      <section className="agency-work" id="work" aria-labelledby="agency-work-title">
        <div className="ax-container">
          <div className="agency-section-label"><span>01 / Selected work</span><span>Built to show what is possible</span></div>
          <div className="agency-work-heading agency-reveal">
            <h2 id="agency-work-title">Different worlds.<br /><em>Same ambition.</em></h2>
            <p>A live competitive platform and three distinct website concepts. Explore the work, the decisions behind it, and the details that make it useful.</p>
          </div>
          <div className="agency-project-list">
            {selectedWork.map((project, index) => (
              <article className={`agency-project agency-reveal${index === 0 ? " studio-home-feature" : ""}`} key={project.slug}>
                <Link className="agency-project-image" href={project.href} aria-label={`Read the ${project.name} case study`}>
                  <span className="agency-project-image-media">
                    <Image src={project.image} alt={`${project.name} ${index === 0 ? "live platform" : "website concept"}`} width={project.width} height={project.height} sizes="(max-width: 800px) 100vw, 85vw" />
                  </span>
                  <span className="agency-project-open" aria-hidden="true">↗</span>
                </Link>
                <div className="agency-project-info">
                  <span className="agency-project-number">0{index + 1} / 04</span>
                  <div>
                    <p>{project.category} / {project.status}</p>
                    <h3><Link href={project.href}>{project.name}</Link></h3>
                    <span>{project.summary}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Link className="agency-arrow-link agency-work-more" href="/work">Explore selected work <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="agency-services" aria-labelledby="agency-services-title">
        <div className="ax-container">
          <div className="agency-section-label"><span>02 / What we do</span><span>One studio, start to finish</span></div>
          <div className="agency-services-grid">
            <div className="agency-reveal">
              <h2 id="agency-services-title">A website should feel like <em>you.</em></h2>
              <p className="agency-services-intro">Custom web design, art direction, and development in one place. The result is a site with a distinct point of view and a clear job to do.</p>
              <Link className="agency-arrow-link" href="/services">Explore services <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="agency-service-list">
              {services.map((service) => (
                <div className="agency-service agency-reveal" key={service.number}>
                  <span>{service.number}</span>
                  <div><h3>{service.title}</h3><p>{service.detail}</p></div>
                  <span aria-hidden="true">↗</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="studio-home-person ax-container">
        <div><span className="studio-eyebrow">03 / Independent by design</span><h2>One conversation.<br /><em>One maker.</em></h2></div>
        <div><p className="studio-lead">I’m Evan Nicholson, the designer and developer behind Atheus.</p><p>I work across strategy, visual direction, interface design and development. The person discussing your brief is the same person making the design decisions and building the result.</p><Link className="agency-arrow-link" href="/studio">Meet the studio ↗</Link></div>
      </section>
      <section className="agency-manifesto" aria-labelledby="agency-manifesto-title">
        <div className="ax-container">
          <div className="agency-section-label"><span>04 / Our point of view</span><span>Made to stand apart</span></div>
          <h2 className="agency-reveal" id="agency-manifesto-title">A template can fill a page.<br /><em>It can’t tell your story.</em></h2>
          <div className="agency-manifesto-bottom agency-reveal">
            <span className="agency-asterisk" aria-hidden="true">✳</span>
            <p>We make digital experiences with personality, purpose, and enough craft to leave an impression long after the tab closes.</p>
          </div>
        </div>
      </section>

      <section className="agency-offer" aria-labelledby="agency-offer-title">
        <div className="ax-container agency-offer-grid">
          <div>
            <div className="agency-section-label"><span>05 / Make a move</span></div>
            <h2 className="agency-reveal" id="agency-offer-title">Your next chapter deserves a better website.</h2>
          </div>
          <div className="agency-offer-aside">
            <p>Custom business websites start at £600. Tell us what you are building and we will shape a clear scope around it.</p>
            <Link className="agency-btn" href="/contact">Start a project <span aria-hidden="true">↗</span></Link>
            <Link className="agency-offer-small" href="/services#pricing">How pricing works ↗</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

import Image from "next/image";
import Link from "next/link";

import { HomeHero } from "@/components/marketing/home-hero";
import { AgencyLoader } from "@/components/marketing/agency-loader";
import { AgencyMotion } from "@/components/marketing/agency-motion";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { StructuredData } from "@/components/marketing/structured-data";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_ORIGIN, marketingMetadata } from "@/lib/seo";

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

const projects = [
  { number: "01", name: "Hearth & Co", category: "Hospitality / Concept site", summary: "A neighbourhood cafe with a digital presence as inviting as the place itself.", image: "/brand/sites-hearth.jpg", alt: "Hearth & Co cafe website concept", href: "/demos/hearth-co" },
  { number: "02", name: "Ridgeway Civils", category: "Construction / Concept site", summary: "Heavy industry, presented with the confidence and clarity it deserves.", image: "/brand/ridgeway-hero.jpg", alt: "Ridgeway Civils website concept", href: "/demos/ridgeway" },
  { number: "03", name: "Northline Electrical", category: "Trades / Concept site", summary: "A precise service experience designed to turn urgency into an enquiry.", image: "/brand/northline-hero.jpg", alt: "Northline Electrical website concept", href: "/demos/northline" },
] as const;

const services = [
  { number: "01", title: "Art direction", detail: "A visual language that could only belong to your business." },
  { number: "02", title: "Web design", detail: "Every page considered, from the first impression to the final click." },
  { number: "03", title: "Development", detail: "Fast, responsive sites built to work beautifully in the real world." },
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
            <p>Three working concepts, each with its own voice. Open the sites, explore the details, and see the thinking in motion.</p>
          </div>
          <div className="agency-project-list">
            {projects.map((project) => (
              <article className="agency-project agency-reveal" key={project.number}>
                <Link className="agency-project-image" href={project.href} aria-label={`Explore ${project.name} concept site`}>
                  <span className="agency-project-image-media">
                    <Image src={project.image} alt={project.alt} width={1500} height={900} sizes="(max-width: 800px) 100vw, 65vw" />
                  </span>
                  <span className="agency-project-open" aria-hidden="true">↗</span>
                </Link>
                <div className="agency-project-info">
                  <span className="agency-project-number">{project.number} / 03</span>
                  <div>
                    <p>{project.category}</p>
                    <h3><Link href={project.href}>{project.name}</Link></h3>
                    <span>{project.summary}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Link className="agency-arrow-link agency-work-more" href="/demos">Explore all concepts <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="agency-services" aria-labelledby="agency-services-title">
        <div className="ax-container">
          <div className="agency-section-label"><span>02 / What we do</span><span>One studio, start to finish</span></div>
          <div className="agency-services-grid">
            <div className="agency-reveal">
              <h2 id="agency-services-title">A website should feel like <em>you.</em></h2>
              <p className="agency-services-intro">Custom web design, art direction, and development in one place. The result is a site with a distinct point of view and a clear job to do.</p>
              <Link className="agency-arrow-link" href="/products/sites">Explore websites <span aria-hidden="true">↗</span></Link>
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

      <section className="agency-manifesto" aria-labelledby="agency-manifesto-title">
        <div className="ax-container">
          <div className="agency-section-label"><span>03 / Our point of view</span><span>Made to stand apart</span></div>
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
            <div className="agency-section-label"><span>04 / Make a move</span></div>
            <h2 className="agency-reveal" id="agency-offer-title">Your next chapter deserves a better website.</h2>
          </div>
          <div className="agency-offer-aside">
            <p>Custom business websites start at £600. Tell us what you are building and we will shape a clear scope around it.</p>
            <Link className="agency-btn" href="/contact">Start a project <span aria-hidden="true">↗</span></Link>
            <Link className="agency-offer-small" href="/products/sites#pricing">How pricing works ↗</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

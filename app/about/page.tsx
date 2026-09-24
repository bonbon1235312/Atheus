import Image from "next/image";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { marketingMetadata } from "@/lib/seo";

export const metadata = marketingMetadata({
  title: "About Atheus | Independent UK Digital Design Studio",
  description: "Meet Atheus, an independent UK studio combining web design, development and digital product thinking to create distinctive online experiences.",
  path: "/about",
});

const principles = [
  { number: "01", title: "Start with the story", body: "A design only works when it sounds and feels like the business behind it." },
  { number: "02", title: "Make every detail earn its place", body: "Type, movement, content, and code should all help people understand and act." },
  { number: "03", title: "Build for real life", body: "The site has to be fast on a phone, clear to use, and easy to grow after launch." },
] as const;

export default function AboutPage() {
  return (
    <MarketingShell variant="agency">
      <section className="agency-subhero agency-about-hero">
        <div className="ax-container">
          <div className="agency-section-label"><span>Studio / Atheus</span><span>Design meets engineering</span></div>
          <div className="agency-subhero-grid">
            <h1>Built with intent.<br /><em>Made to matter.</em></h1>
            <p>Atheus is an independent digital practice creating custom websites and software. We believe the best work has a point of view and a purpose.</p>
          </div>
          <div className="agency-about-gallery" aria-label="Examples of Atheus digital work">
            <Image src="/brand/sites-hearth.jpg" alt="Hearth & Co website concept" width={1100} height={740} sizes="(max-width: 760px) 100vw, 60vw" priority />
            <Image src="/brand/northline-hero.jpg" alt="Northline Electrical website concept" width={700} height={740} sizes="(max-width: 760px) 45vw, 35vw" />
          </div>
        </div>
      </section>
      <section className="agency-services">
        <div className="ax-container">
          <div className="agency-section-label"><span>01 / How we think</span><span>Principles before decoration</span></div>
          <div className="agency-services-grid">
            <div><h2>Good work starts with <em>curiosity.</em></h2><p className="agency-services-intro">We ask what the business needs people to feel, understand, and do. Then we make choices that serve that answer.</p></div>
            <div className="agency-service-list">
              {principles.map((item) => (
                <div className="agency-service" key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.body}</p></div><span aria-hidden="true">↗</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="agency-manifesto">
        <div className="ax-container">
          <div className="agency-section-label"><span>02 / More than websites</span></div>
          <h2>Design the experience.<br /><em>Engineer the reality.</em></h2>
          <div className="agency-manifesto-bottom"><span className="agency-asterisk" aria-hidden="true">✳</span><p>Alongside sites, Atheus builds products for real operational work. The same care runs through both.</p></div>
        </div>
      </section>
      <section className="agency-offer">
        <div className="ax-container agency-offer-grid">
          <div><div className="agency-section-label"><span>03 / Work together</span></div><h2>Have something in mind?</h2></div>
          <div className="agency-offer-aside"><p>Tell us about the idea, the people it serves, and where you want it to go.</p><Link className="agency-btn" href="/contact">Start a project <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </MarketingShell>
  );
}

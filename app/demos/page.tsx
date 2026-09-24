import Image from "next/image";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { DEMO_SITES } from "@/lib/demo-sites";
import { marketingMetadata } from "@/lib/seo";

export const metadata = marketingMetadata({
  title: "Web Design Portfolio & Live Concepts | Atheus",
  description: "Explore live website concepts by Atheus for hospitality, construction and electrical trades. See how custom web design gives each business its own voice.",
  path: "/demos",
});

export default function DemosPage() {
  return (
    <MarketingShell variant="agency">
      <section className="agency-subhero">
        <div className="ax-container">
          <div className="agency-section-label"><span>Work / Atheus Studio</span><span>Three working concepts</span></div>
          <div className="agency-subhero-grid">
            <h1>Proof is in<br /><em>the details.</em></h1>
            <p>Different industries need different voices. These are full concept builds, made to show the range of what a custom site can be.</p>
          </div>
        </div>
      </section>
      <section className="agency-work agency-work--index" aria-label="Website concepts">
        <div className="ax-container">
          {DEMO_SITES.map((site, index) => (
            <article className="agency-case" key={site.slug}>
              <div className="agency-case-top">
                <span>0{index + 1} / 03</span>
                <span>{site.category} / Concept site</span>
              </div>
              <Link className="agency-case-image" href={`/demos/${site.slug}`} aria-label={`Explore the ${site.name} concept`}>
                <Image src={site.image} alt={`${site.name} website concept`} width={1700} height={950} sizes="(max-width: 760px) 100vw, 85vw" priority={index === 0} />
                <span aria-hidden="true">↗</span>
              </Link>
              <div className="agency-case-bottom">
                <h2>{site.name}</h2>
                <div><p>{site.description}</p><Link className="agency-arrow-link" href={`/demos/${site.slug}`}>Explore the site <span aria-hidden="true">↗</span></Link></div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="agency-offer">
        <div className="ax-container agency-offer-grid">
          <div><div className="agency-section-label"><span>Your project / Next</span></div><h2>Now let’s build <em>yours.</em></h2></div>
          <div className="agency-offer-aside"><p>Bring us the brief. We’ll find the right visual voice and build a site that works as hard as you do.</p><Link className="agency-btn" href="/contact">Start a project <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </MarketingShell>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Custom websites",
  description: "Custom websites by Atheus, designed and built for the business behind the brief. Small business sites start at £600.",
  openGraph: { images: [{ url: "/brand/sites-hearth.jpg" }] },
};

const steps = [
  { number: "01", title: "A real conversation", body: "Tell us about your business, your audience, and what the site needs to achieve." },
  { number: "02", title: "A design with direction", body: "We shape the visual language, content structure, and key interactions around the brief." },
  { number: "03", title: "A build with care", body: "The site comes to life with responsive layouts, accessible details, and purposeful movement." },
  { number: "04", title: "A confident launch", body: "Review the live preview, refine what matters, and put the finished site into the world." },
] as const;

export default function SitesPage() {
  const product = getProduct("sites")!;
  return (
    <MarketingShell variant="agency">
      <section className="agency-subhero agency-sites-hero">
        <div className="ax-container">
          <div className="agency-section-label"><span>Websites / Atheus Studio</span><span>Custom by design</span></div>
          <div className="agency-subhero-grid">
            <h1>Your business has a story.<br /><em>Your site should tell it.</em></h1>
            <div><p>Custom design and development for ambitious businesses. From a focused first site to a full brand experience.</p><Link className="agency-arrow-link" href="/contact">Start a project <span aria-hidden="true">↗</span></Link></div>
          </div>
          <div className="agency-sites-feature">
            <Image src="/brand/sites-hearth.jpg" alt="Hearth & Co custom cafe website concept" width={1700} height={950} sizes="100vw" priority />
            <div className="agency-sites-feature-note"><span>Featured concept / Hearth & Co</span><Link href="/demos/hearth-co">Explore the site ↗</Link></div>
          </div>
        </div>
      </section>

      <section className="agency-services">
        <div className="ax-container">
          <div className="agency-section-label"><span>01 / The approach</span><span>Design and build, together</span></div>
          <div className="agency-services-grid">
            <div><h2>Different brief.<br /><em>Different answer.</em></h2><p className="agency-services-intro">There is no house template. The visual direction, content, and technology all follow what your business actually needs.</p><Link className="agency-arrow-link" href="/demos">See the work <span aria-hidden="true">↗</span></Link></div>
            <div className="agency-service-list">
              {steps.map((step) => <div className="agency-service" key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.body}</p></div><span aria-hidden="true">↗</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="agency-pricing" id="pricing">
        <div className="ax-container">
          <div className="agency-section-label"><span>02 / Investment</span><span>Clear scope, clear quote</span></div>
          <div className="agency-pricing-intro"><h2>A good fit at<br /><em>every scale.</em></h2><p>{product.pricingNote}</p></div>
          <div className="agency-pricing-list">
            {product.pricingTiers.map((tier, index) => (
              <div className="agency-pricing-row" key={tier.name}>
                <span>0{index + 1}</span>
                <h3>{tier.name}</h3>
                <p>{tier.body}</p>
                <strong>{tier.price}</strong>
              </div>
            ))}
          </div>
          <Link className="agency-btn agency-pricing-cta" href="/contact">Discuss your project <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="agency-faq">
        <div className="ax-container agency-faq-grid">
          <div><div className="agency-section-label"><span>03 / Good to know</span></div><h2>Questions,<br /><em>answered.</em></h2></div>
          <div>{product.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
        </div>
      </section>

      <section className="agency-manifesto">
        <div className="ax-container">
          <div className="agency-section-label"><span>04 / Your move</span></div>
          <h2>Something worth<br /><em>showing the world.</em></h2>
          <div className="agency-manifesto-bottom"><span className="agency-asterisk" aria-hidden="true">✳</span><Link className="agency-arrow-link" href="/contact">Start a project <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </MarketingShell>
  );
}

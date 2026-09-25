import Image from "next/image";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { StructuredData } from "@/components/marketing/structured-data";
import { getProduct } from "@/lib/products";
import { SITE_ORIGIN, breadcrumbSchema, marketingMetadata } from "@/lib/seo";

const description = "Custom web design and development for UK businesses. Atheus creates distinctive, responsive websites shaped around your brand. Projects start at £600.";

export const metadata = marketingMetadata({
  title: "Custom Web Design & Development UK | Atheus",
  description,
  path: "/products/sites",
  image: "/brand/sites-hearth.jpg",
  imageAlt: "Hearth & Co custom website concept by Atheus",
});

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_ORIGIN}/products/sites#service`,
  name: "Custom web design and development",
  serviceType: "Web design and development",
  description,
  url: `${SITE_ORIGIN}/products/sites`,
  provider: { "@id": `${SITE_ORIGIN}/#organization` },
  areaServed: { "@type": "Country", name: "United Kingdom" },
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
      <StructuredData data={serviceSchema} />
      <StructuredData data={breadcrumbSchema([
        { name: "Atheus", path: "/" },
        { name: "Websites", path: "/products/sites" },
      ])} />
      <section className="agency-subhero agency-sites-hero">
        <div className="ax-container">
          <div className="agency-section-label"><span>Websites / Atheus Studio</span><span>Custom by design</span></div>
          <div className="agency-subhero-grid">
            <h1>Your business has a story.<br /><em>Let it speak.</em></h1>
            <div><p>Custom web design and development for ambitious UK businesses. From a focused first site to a full brand experience.</p><Link className="agency-arrow-link" href="/contact">Start a project <span aria-hidden="true">↗</span></Link></div>
          </div>
          <div className="agency-sites-feature">
            <Image src="/brand/sites-hearth.jpg" alt="Hearth & Co custom cafe website concept" width={1700} height={950} sizes="100vw" preload loading="eager" fetchPriority="high" />
            <div className="agency-sites-feature-note"><span>Featured concept / Hearth & Co</span><Link href="/demos/hearth-co">Explore the site ↗</Link></div>
          </div>
        </div>
      </section>

      <section className="agency-services">
        <div className="ax-container">
          <div className="agency-section-label"><span>01 / The approach</span><span>Design and build, together</span></div>
          <div className="agency-services-grid">
            <div><h2>Custom web design.<br /><em>Entirely yours.</em></h2><p className="agency-services-intro">There is no house template. The visual direction, content, and technology all follow what your business actually needs.</p><Link className="agency-arrow-link" href="/demos">See website concepts <span aria-hidden="true">↗</span></Link></div>
            <div className="agency-service-list">
              {steps.map((step) => <div className="agency-service" key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.body}</p></div><span aria-hidden="true">↗</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="agency-sites-scope" aria-labelledby="agency-sites-scope-title">
        <div className="ax-container">
          <div className="agency-section-label"><span>02 / What the build covers</span><span>Useful from first visit to launch</span></div>
          <div className="agency-sites-scope-intro">
            <h2 id="agency-sites-scope-title">More than a<br /><em>first impression.</em></h2>
            <p>Atheus plans the pages people need, designs a distinct visual language, and builds the site to work across devices. The exact pages, content and integrations are agreed with you before development begins.</p>
          </div>
          <div className="agency-sites-scope-list">
            <div><span>01</span><h3>Clear content structure</h3><p>Navigation, page hierarchy and copy direction shaped around what visitors need to understand before they enquire.</p></div>
            <div><span>02</span><h3>Responsive design</h3><p>Original art direction carried through desktop and mobile layouts, with accessible controls and purposeful movement.</p></div>
            <div><span>03</span><h3>Search foundations</h3><p>Descriptive page titles, crawlable links, structured content and performance-minded assets built into the finished site.</p></div>
          </div>
          <Link className="agency-arrow-link" href="/contact">Discuss your website brief <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="agency-pricing" id="pricing">
        <div className="ax-container">
          <div className="agency-section-label"><span>03 / Investment</span><span>Clear scope, clear quote</span></div>
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
          <div><div className="agency-section-label"><span>04 / Good to know</span></div><h2>Questions,<br /><em>answered.</em></h2></div>
          <div>{product.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
        </div>
      </section>

      <section className="agency-manifesto">
        <div className="ax-container">
          <div className="agency-section-label"><span>05 / Your move</span></div>
          <h2>Something worth<br /><em>showing the world.</em></h2>
          <div className="agency-manifesto-bottom"><span className="agency-asterisk" aria-hidden="true">✳</span><Link className="agency-arrow-link" href="/contact">Start a project <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </MarketingShell>
  );
}

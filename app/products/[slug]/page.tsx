import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getProduct, products, statusLabel } from "@/lib/products";
import { marketingMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.filter((product) => product.slug !== "sites").map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || slug === "sites") notFound();
  const titles: Record<string, string> = {
    league: "League Management Software | Atheus",
    club: "Club Management Software | Atheus",
    blackwall: "BlackWall Access Control | Atheus",
  };
  return marketingMetadata({
    title: titles[slug] ?? `${product.name} | Atheus`,
    description: product.description,
    path: `/products/${slug}`,
    image: product.image,
    imageAlt: product.imageAlt,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || slug === "sites") notFound();

  return (
    <MarketingShell variant="agency">
      <section className="agency-subhero agency-product-hero">
        <div className="ax-container">
          <div className="agency-section-label"><span>Products / {product.name}</span><span>{product.category} / {statusLabel[product.status]}</span></div>
          <div className="agency-subhero-grid">
            <h1>{product.name}<span className="agency-product-dot">.</span><br /><em>{product.tagline}</em></h1>
            <div><p>{product.description}</p><Link className="agency-arrow-link" href={product.primaryCta.href}>{product.primaryCta.label} <span aria-hidden="true">↗</span></Link></div>
          </div>
          <div className="agency-product-visual">
            <Image src={product.image} alt={product.imageAlt} width={1700} height={950} sizes="100vw" priority />
          </div>
        </div>
      </section>

      <section className="agency-services">
        <div className="ax-container">
          <div className="agency-section-label"><span>01 / What it does</span><span>Built for the work</span></div>
          <div className="agency-services-grid">
            <div><h2>Clear tools.<br /><em>Real impact.</em></h2><p className="agency-services-intro">{product.tagline} The details are designed around how people actually operate.</p></div>
            <div className="agency-service-list">
              {product.capabilities.map((capability, index) => (
                <div className="agency-service" key={capability.title}><span>0{index + 1}</span><div><h3>{capability.title}</h3><p>{capability.body}</p></div><span aria-hidden="true">↗</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="agency-product-benefits">
        <div className="ax-container">
          <div className="agency-section-label"><span>02 / Why it matters</span></div>
          <h2>Made for the people<br /><em>behind the process.</em></h2>
          <div className="agency-benefit-list">
            {product.benefits.map((benefit, index) => (
              <div key={benefit.title}><span>0{index + 1}</span><h3>{benefit.title}</h3><p>{benefit.body}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="agency-pricing" id="pricing">
        <div className="ax-container">
          <div className="agency-section-label"><span>03 / Access & pricing</span></div>
          <div className="agency-pricing-intro"><h2>Simple to<br /><em>get started.</em></h2><p>{product.pricingNote}</p></div>
          <div className="agency-pricing-list">
            {product.pricingTiers.map((tier, index) => (
              <div className="agency-pricing-row" key={tier.name}><span>0{index + 1}</span><h3>{tier.name}</h3><p>{tier.body}</p><strong>{tier.price}</strong></div>
            ))}
          </div>
          <Link className="agency-btn agency-pricing-cta" href={product.primaryCta.href}>{product.primaryCta.label} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="agency-faq">
        <div className="ax-container agency-faq-grid">
          <div><div className="agency-section-label"><span>04 / Good to know</span></div><h2>Questions,<br /><em>answered.</em></h2></div>
          <div>{product.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
        </div>
      </section>
    </MarketingShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PricingMotion } from "@/components/marketing/pricing-motion";
import { WowCta } from "@/components/marketing/process-rail";
import {
  ProductCapabilityGrid,
  ProductPageHero,
} from "@/components/marketing/product-page-motion";
import { Reveal } from "@/components/marketing/reveal";
import { StepMorph } from "@/components/marketing/step-morph";
import { getProduct, products } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products
    .filter((product) => product.slug !== "sites")
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Atheus`,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

const productProcess = [
  {
    title: "Scope",
    body: "We map the weekly workflow, the people who run it, and the failure modes that already cost time.",
  },
  {
    title: "Configure",
    body: "Defaults first, customisation second. You get a calm admin surface without a training programme.",
  },
  {
    title: "Operate",
    body: "Collection, scheduling, access, and status stay visible. Operators keep the decisions that need judgment.",
  },
  {
    title: "Scale",
    body: "Architecture stays explicit: tenancy, credentials, and ownership as product decisions, not afterthoughts.",
  },
] as const;

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <MarketingShell>
      <ProductPageHero product={product} />

      <section className="ax-section-tight">
        <div className="ax-container">
          <Reveal>
            <div className="ax-highlight-grid">
              {product.highlights.map((item) => (
                <article className="ax-highlight" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="ax-section" style={{ paddingTop: "1rem" }}>
        <div className="ax-container">
          <Reveal className="ax-section-head">
            <h2 className="ax-h2">Capabilities</h2>
            <p className="ax-lead">
              The core surfaces that make {product.name} useful in weekly operations.
            </p>
          </Reveal>
          <ProductCapabilityGrid product={product} />
        </div>
      </section>

      <StepMorph
        kicker="Adoption"
        title={`How teams run ${product.name}`}
        lead="A calm path from first conversation to weekly use."
        steps={[...productProcess]}
      />

      <section className="ax-section" style={{ paddingTop: 0 }}>
        <div className="ax-container ax-split">
          <Reveal>
            <h2 className="ax-h2">Why teams choose it</h2>
            <p className="ax-lead">
              Outcomes that matter once the novelty wears off and the work keeps
              running.
            </p>
          </Reveal>
          <Reveal delayMs={60}>
            <ul className="ax-value-list">
              {product.benefits.map((benefit) => (
                <li key={benefit.title}>
                  <strong>{benefit.title}</strong>
                  <span>{benefit.body}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="ax-section-tight">
        <div className="ax-container">
          <Reveal className="ax-section-head">
            <h2 className="ax-h2">Architecture highlights</h2>
            <p className="ax-lead">
              Practical building blocks, selected for durability and clear ownership.
            </p>
          </Reveal>
          <Reveal>
            <ul className="ax-arch-list">
              {product.architecture.map((item) => (
                <li className="ax-tech-chip" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <PricingMotion
        title={`${product.name} pricing`}
        note={product.pricingNote}
        tiers={product.pricingTiers}
        cta={product.primaryCta}
      />

      <section className="ax-section" style={{ paddingTop: 0 }}>
        <div className="ax-container">
          <Reveal className="ax-section-head">
            <h2 className="ax-h2">FAQ</h2>
          </Reveal>
          <div className="ax-faq-list">
            {product.faqs.map((faq) => (
              <details className="ax-faq" key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <WowCta
        title={`Interested in ${product.name}?`}
        lead="Tell us about your organisation and how you operate today. We will respond with a clear next step."
        primary={product.primaryCta}
        secondary={product.secondaryCta}
      />
    </MarketingShell>
  );
}

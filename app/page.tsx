import type { Metadata } from "next";

import Link from "next/link";

import { HomeHero } from "@/components/marketing/home-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MotionProductCard } from "@/components/marketing/motion-product-card";
import { WowCta } from "@/components/marketing/process-rail";
import { ProofMosaic } from "@/components/marketing/proof-mosaic";
import { Reveal } from "@/components/marketing/reveal";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Atheus",
  description:
    "Custom websites from £600, plus premium SaaS products. Atheus builds software that looks and works serious.",
  openGraph: {
    images: [{ url: "/brand/sites-hearth.jpg" }],
  },
};

const values = [
  {
    title: "Custom, not templated",
    body: "Every site and product surface is designed for the brief. No skinning someone else's layout.",
  },
  {
    title: "Fast by default",
    body: "Performance is part of the craft. Pages should feel instant on a phone and sharp on a laptop.",
  },
  {
    title: "Clear pricing",
    body: "Small business sites start at £600. Larger brand builds and SaaS products scale with scope.",
  },
  {
    title: "One team end to end",
    body: "Design and engineering stay together. Fewer handoffs, fewer diluted decisions.",
  },
];

export default function Home() {
  const sites = products.find((p) => p.slug === "sites")!;
  const suite = products.filter((p) => p.slug !== "sites");

  return (
    <MarketingShell>
      <HomeHero />
      <ProofMosaic />

      {/* Teaser only — the full tier breakdown lives on /products/sites so the
          two pages stop rendering the same three cards. */}
      <section className="ax-section ax-section-tint">
        <div className="ax-container ax-price-teaser">
          <Reveal>
            <p className="ax-kicker-pill">Pricing</p>
            <h2 className="ax-h2">Clear pricing, before you have to ask.</h2>
          </Reveal>
          <Reveal delayMs={60}>
            <p className="ax-lead">{sites.pricingNote}</p>
            <Link className="ax-btn ax-btn-primary ax-btn-icon" href="/products/sites#pricing">
              See the full breakdown
              <span className="ax-btn-orb" aria-hidden="true">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="ax-section">
        <div className="ax-container ax-split">
          <Reveal>
            <h2 className="ax-h2">Why people pick Atheus</h2>
            <p className="ax-lead">
              Whether you need a website or a product platform, the standard stays the
              same: intentional, fast, and hard to ignore.
            </p>
          </Reveal>
          <Reveal delayMs={60}>
            <ul className="ax-value-list">
              {values.map((value) => (
                <li key={value.title}>
                  <strong>{value.title}</strong>
                  <span>{value.body}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="ax-section" style={{ paddingTop: 0 }}>
        <div className="ax-container">
          <Reveal className="ax-section-head">
            <h2 className="ax-h2">Also shipping</h2>
            <p className="ax-lead">
              A growing product suite beside Sites. Same engineering bar.
            </p>
          </Reveal>
          <div className="ax-product-grid">
            {suite.map((product, index) => (
              <Reveal key={product.slug} delayMs={index * 50}>
                <MotionProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WowCta
        title="Ready to make people say wow?"
        lead="Send a short brief. Business name, what you sell, and any links you already have. We will reply with a clear next step."
        primary={{ href: "/contact", label: "Request a quote" }}
        secondary={{ href: "/products/sites", label: "View Sites" }}
      />
    </MarketingShell>
  );
}

"use client";

import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import type { PricingTier } from "@/lib/products";

export function PricingMotion({
  title = "Sites pricing",
  note,
  tiers,
  cta,
}: {
  title?: string;
  note: string;
  tiers: PricingTier[];
  cta?: { href: string; label: string };
}) {
  const action = cta ?? { href: "/products/sites", label: "Explore Sites" };

  return (
    <section className="ax-section ax-section-tint">
      <div className="ax-container">
        <Reveal className="ax-section-head">
          <h2 className="ax-h2">{title}</h2>
          <p className="ax-lead">{note}</p>
        </Reveal>
        <div className="ax-pricing" data-count={String(Math.min(3, tiers.length))}>
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className="ax-price-card"
              data-featured={
                tier.name === "Small business"
                  ? "true"
                  : tier.featured
                    ? "true"
                    : "false"
              }
            >
              <h3 className="ax-h3">{tier.name}</h3>
              <p className="ax-price">{tier.price}</p>
              <p>{tier.body}</p>
              <Link className="ax-btn ax-btn-secondary" href="/contact">
                Start here
              </Link>
            </article>
          ))}
        </div>
        <div className="ax-section-cta-row">
          <Link className="ax-btn ax-btn-primary" href={action.href}>
            {action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

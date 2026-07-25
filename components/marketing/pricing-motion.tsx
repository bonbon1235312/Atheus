"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { Magnetic, SpotlightCard } from "@/components/marketing/motion-primitives";
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
  const reduce = useReducedMotion();
  const action = cta ?? { href: "/products/sites", label: "Explore Sites" };

  return (
    <section className="ax-section ax-section-tint">
      <div className="ax-container">
        <Reveal className="ax-section-head">
          <h2 className="ax-h2">{title}</h2>
          <p className="ax-lead">{note}</p>
        </Reveal>
        <div className="ax-pricing" data-count={String(Math.min(3, tiers.length))}>
          {tiers.map((tier, index) => (
            <Reveal as="article" key={tier.name} delayMs={index * 50}>
              <SpotlightCard>
                <div
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
                  <motion.p
                    className="ax-price"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                  >
                    {tier.price}
                  </motion.p>
                  <p>{tier.body}</p>
                  <Magnetic strength={0.2}>
                    <Link className="ax-btn ax-btn-secondary" href="/contact">
                      Start here
                    </Link>
                  </Magnetic>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
        <div className="ax-section-cta-row">
          <Magnetic>
            <Link
              className="ax-btn ax-btn-primary ax-btn-icon"
              href={action.href}
            >
              {action.label}
              <span className="ax-btn-orb" aria-hidden="true">
                →
              </span>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

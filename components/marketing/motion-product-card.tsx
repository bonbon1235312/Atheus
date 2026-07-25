"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Magnetic, SpotlightCard, TiltFrame } from "@/components/marketing/motion-primitives";
import { statusLabel, type Product } from "@/lib/products";

export function MotionProductCard({ product }: { product: Product }) {
  const reduce = useReducedMotion();

  return (
    <TiltFrame className="ax-product-tilt">
      <SpotlightCard>
        <Link
          className="ax-product-card"
          href={`/products/${product.slug}`}
          aria-label={`${product.name}: ${product.tagline}`}
          style={{ "--ax-product-accent": product.accent } as CSSProperties}
        >
          <div className="ax-product-card-media" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt="" loading="lazy" decoding="async" />
          </div>

          <div className="ax-product-card-top">
            <div>
              <span className="ax-product-logo">{product.mark}</span>
              <h3 className="ax-h3">{product.name}</h3>
            </div>
            <span className="ax-badge" data-tone={product.status}>
              {statusLabel[product.status]}
            </span>
          </div>

          <p>{product.tagline}</p>

          <div className="ax-product-card-footer">
            <span className="ax-product-category">{product.category}</span>
            <span className="ax-text-link">
              Learn more
              <motion.span
                aria-hidden="true"
                animate={reduce ? undefined : { x: [0, 3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </span>
          </div>
        </Link>
      </SpotlightCard>
    </TiltFrame>
  );
}

export function ProductsHero() {
  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="ax-page-hero">
      <div className="ax-container">
        <motion.p
          className="ax-kicker-pill"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
        >
          Product suite
        </motion.p>
        <h1 className="ax-h1 ax-display-split">
          <motion.span
            className="ax-line"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.85, ease, delay: 0.05 }}
          >
            Products built to
          </motion.span>
          <span className="ax-line-mask">
            <motion.em
              initial={reduce ? false : { y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.9, ease, delay: 0.15 }}
            >
              feel expensive.
            </motion.em>
          </span>
        </h1>
        <motion.p
          className="ax-lead"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease, delay: 0.3 }}
        >
          Custom websites from £600, plus SaaS tools for operations, communities, and
          access control.
        </motion.p>
        <motion.div
          className="ax-hero-actions"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease, delay: 0.4 }}
        >
          <Magnetic>
            <Link className="ax-btn ax-btn-primary ax-btn-icon" href="/products/sites">
              Get a site
              <span className="ax-btn-orb" aria-hidden="true">
                →
              </span>
            </Link>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

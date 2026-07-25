"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Magnetic, SpotlightCard, TiltFrame } from "@/components/marketing/motion-primitives";
import { ProductVisual } from "@/components/marketing/product-visual";
import { StatusBadge } from "@/components/marketing/status-badge";
import type { Product } from "@/lib/products";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductPageHero({ product }: { product: Product }) {
  const reduce = useReducedMotion();

  return (
    <section
      className="ax-product-hero"
      style={{ "--ax-product-accent": product.accent } as CSSProperties}
    >
      <div className="ax-container ax-product-hero-grid">
        <div>
          <motion.div
            className="ax-product-meta"
            style={{ marginBottom: "1rem" }}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
          >
            <StatusBadge status={product.status} />
            <span className="ax-badge">{product.category}</span>
          </motion.div>
          <motion.p
            className="ax-product-tagline"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.05 }}
          >
            {product.tagline}
          </motion.p>
          <h1 className="ax-h1 ax-display-split">
            <span className="ax-line-mask">
              <motion.span
                className="ax-line"
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.85, ease, delay: 0.1 }}
              >
                {product.name}
              </motion.span>
            </span>
          </h1>
          <motion.p
            className="ax-lead"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease, delay: 0.22 }}
          >
            {product.description}
          </motion.p>
          <motion.div
            className="ax-hero-actions"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.32 }}
          >
            <Magnetic>
              <Link
                className="ax-btn ax-btn-primary ax-btn-icon"
                href={product.primaryCta.href}
              >
                {product.primaryCta.label}
                <span className="ax-btn-orb" aria-hidden="true">
                  →
                </span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.18}>
              <Link
                className="ax-btn ax-btn-secondary"
                href={product.secondaryCta.href}
              >
                {product.secondaryCta.label}
              </Link>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.95, ease, delay: 0.2 }}
          style={{ transformPerspective: 1200 }}
        >
          <TiltFrame>
            <ProductVisual
              src={product.image}
              alt={product.imageAlt}
              priority
              caption={`${product.name} product surface`}
            />
          </TiltFrame>
        </motion.div>
      </div>
    </section>
  );
}

export function ProductCapabilityGrid({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="ax-feature-grid">
      {product.capabilities.map((capability, index) => (
        <motion.article
          key={capability.title}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, delay: index * 0.05, ease }}
        >
          <SpotlightCard>
            <div className="ax-feature">
              <h3 className="ax-h3">{capability.title}</h3>
              <p>{capability.body}</p>
            </div>
          </SpotlightCard>
        </motion.article>
      ))}
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { ProductVisual } from "@/components/marketing/product-visual";
import { StatusBadge } from "@/components/marketing/status-badge";
import type { Product } from "@/lib/products";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductPageHero({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const enter = reduce ? false : { opacity: 0, y: 16 };

  return (
    <section
      className="ax-product-hero"
      style={{ "--ax-product-accent": product.accent } as CSSProperties}
    >
      <div className="ax-container ax-product-hero-grid">
        <motion.div
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="ax-product-meta" style={{ marginBottom: "1rem" }}>
            <StatusBadge status={product.status} />
            <span className="ax-badge">{product.category}</span>
          </div>
          <p className="ax-product-tagline">{product.tagline}</p>
          <h1 className="ax-h1">{product.name}</h1>
          <p className="ax-lead">{product.description}</p>
          <div className="ax-hero-actions">
            <Link className="ax-btn ax-btn-primary" href={product.primaryCta.href}>
              {product.primaryCta.label}
            </Link>
            <Link className="ax-btn ax-btn-secondary" href={product.secondaryCta.href}>
              {product.secondaryCta.label}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: reduce ? 0 : 0.08 }}
        >
          <ProductVisual
            src={product.image}
            alt={product.imageAlt}
            priority
            caption={`${product.name} product surface`}
          />
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
      {product.capabilities.map((capability) => (
        <article className="ax-feature" key={capability.title}>
          <h3 className="ax-h3">{capability.title}</h3>
          <p>{capability.body}</p>
        </article>
      ))}
    </div>
  );
}

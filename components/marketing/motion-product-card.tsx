"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductsHero() {
  const reduce = useReducedMotion();

  return (
    <section className="ax-page-hero">
      <div className="ax-container">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="ax-kicker-pill">Product suite</p>
          <h1 className="ax-h1">
            Products built to <em>run the work.</em>
          </h1>
          <p className="ax-lead">
            Custom websites from £600, plus SaaS tools for operations, communities, and
            access control.
          </p>
          <div className="ax-hero-actions">
            <Link className="ax-btn ax-btn-primary" href="/products/sites">
              Get a site
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

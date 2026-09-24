"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

export function SitesHero() {
  const reduce = useReducedMotion();
  const enter = reduce ? false : { opacity: 0, y: 16 };

  return (
    <section className="ax-sites-hero">
      <div className="ax-container ax-sites-hero-grid">
        <motion.div
          className="ax-sites-hero-copy"
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="ax-badge" data-tone="live">
            Sites
          </span>

          <h1 className="ax-h1">
            A website that makes people take you <em>seriously.</em>
          </h1>

          <p className="ax-lead">
            Fully custom sites for small businesses and growing brands. Designed and
            engineered end to end, starting at £600.
          </p>

          <div className="ax-hero-actions">
            <Link className="ax-btn ax-btn-primary" href="/contact">
              Request a quote
            </Link>
            <a className="ax-btn ax-btn-secondary" href="#pricing">
              See pricing
            </a>
          </div>

          <p className="ax-sites-price-note">
            Small business sites from <strong>£600</strong>
          </p>
        </motion.div>

        <motion.div
          className="ax-sites-hero-stage"
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: reduce ? 0 : 0.08 }}
        >
          <div className="ax-sites-frame">
            <Image
              src="/brand/sites-hearth.jpg"
              alt="Custom cafe website example for Hearth and Co"
              width={1600}
              height={900}
              priority
              className="ax-sites-frame-img"
              sizes="(max-width: 960px) 100vw, 640px"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

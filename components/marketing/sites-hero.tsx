"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { Magnetic, TiltFrame } from "@/components/marketing/motion-primitives";
import { ScrambleText } from "@/components/marketing/scramble-text";

const ease = [0.22, 1, 0.36, 1] as const;

export function SitesHero() {
  const reduce = useReducedMotion();

  return (
    <section className="ax-sites-hero">
      <div className="ax-container ax-sites-hero-grid">
        <div className="ax-sites-hero-copy">
          <motion.span
            className="ax-badge"
            data-tone="live"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
          >
            Sites
          </motion.span>

          <h1 className="ax-h1 ax-display-split">
            <motion.span
              className="ax-line"
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease, delay: 0.06 }}
            >
              A website that makes
            </motion.span>
            <span className="ax-line-mask">
              <motion.span
                className="ax-line"
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease, delay: 0.16 }}
              >
                people take you
              </motion.span>
            </span>
            <span className="ax-line-mask">
              <motion.em
                initial={reduce ? false : { y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.95, ease, delay: 0.26 }}
              >
                <ScrambleText text="seriously." as="span" />
              </motion.em>
            </span>
          </h1>

          <motion.p
            className="ax-lead"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.4 }}
          >
            Fully custom sites for small businesses and growing brands. Designed and
            engineered end to end, starting at £600.
          </motion.p>

          <motion.div
            className="ax-hero-actions"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.5 }}
          >
            <Magnetic>
              <Link className="ax-btn ax-btn-primary ax-btn-icon" href="/contact">
                Request a quote
                <span className="ax-btn-orb" aria-hidden="true">
                  →
                </span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.18}>
              <a className="ax-btn ax-btn-secondary" href="#pricing">
                See pricing
              </a>
            </Magnetic>
          </motion.div>

          <motion.p
            className="ax-sites-price-note"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            Small business sites from <strong>£600</strong>
          </motion.p>
        </div>

        <motion.div
          className="ax-sites-hero-stage"
          initial={reduce ? false : { opacity: 0, scale: 0.94, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.05, ease, delay: 0.18 }}
        >
          <TiltFrame>
            <div className="ax-sites-frame ax-bezel-glow">
              <div className="ax-sites-frame-chrome" aria-hidden="true">
                <span />
                <span />
                <span />
                <em>yourbrand.com</em>
              </div>
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
          </TiltFrame>
          <div className="ax-orbit" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

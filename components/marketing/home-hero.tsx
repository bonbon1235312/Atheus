"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { Magnetic, TiltFrame } from "@/components/marketing/motion-primitives";
import { ScrambleText } from "@/components/marketing/scramble-text";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <section className="ax-home-hero">
      <div className="ax-container ax-home-hero-grid">
        <div className="ax-home-hero-copy">
          <motion.p
            className="ax-kicker-pill"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            Custom websites · from £600
          </motion.p>

          <h1 className="ax-display ax-display-split">
            <motion.span
              className="ax-line"
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease, delay: 0.08 }}
            >
              Make your business look
            </motion.span>
            <span className="ax-line-mask">
              <motion.em
                initial={reduce ? false : { y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.95, ease, delay: 0.18 }}
              >
                <ScrambleText text="undeniable" as="span" />
              </motion.em>
            </span>
            <motion.span
              className="ax-line"
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease, delay: 0.28 }}
            >
              online.
            </motion.span>
          </h1>

          <motion.p
            className="ax-lead ax-lead-lg"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.42 }}
          >
            Atheus designs and builds fully custom websites for small businesses and
            growing brands. Premium craft. Clear pricing. No template leftovers.
          </motion.p>

          <motion.div
            className="ax-hero-actions"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.52 }}
          >
            <Magnetic>
              <Link
                className="ax-btn ax-btn-primary ax-btn-icon"
                href="/products/sites"
              >
                Get a site
                <span className="ax-btn-orb" aria-hidden="true">
                  →
                </span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.18}>
              <Link className="ax-btn ax-btn-secondary" href="/contact">
                Request a quote
              </Link>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          className="ax-home-hero-stage"
          initial={reduce ? false : { opacity: 0, scale: 0.94, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.05, ease, delay: 0.2 }}
        >
          <TiltFrame className="ax-tilt-stage">
            <div className="ax-bezel ax-bezel-glow">
              <div className="ax-bezel-inner">
                <div className="ax-browser-chrome" aria-hidden="true">
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
                  className="ax-home-hero-img"
                  sizes="(max-width: 960px) 100vw, 52vw"
                />
              </div>
            </div>
          </TiltFrame>

          <motion.div
            className="ax-float-card"
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, x: -24, y: 18 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.7 }}
            whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
          >
            <strong>From £600</strong>
            <span>Small business sites</span>
          </motion.div>

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

"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export function AboutHero() {
  const reduce = useReducedMotion();

  return (
    <section className="ax-page-hero">
      <div className="ax-container">
        <motion.p
          className="ax-kicker-pill"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
        >
          Company
        </motion.p>
        <h1 className="ax-h1 ax-display-split">
          <span className="ax-line-mask">
            <motion.span
              className="ax-line"
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.85, ease, delay: 0.05 }}
            >
              Software with
            </motion.span>
          </span>
          <span className="ax-line-mask">
            <motion.em
              initial={reduce ? false : { y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.9, ease, delay: 0.15 }}
            >
              serious craft.
            </motion.em>
          </span>
        </h1>
        <motion.p
          className="ax-lead"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease, delay: 0.3 }}
        >
          Atheus builds SaaS products and fully custom websites for teams that want
          to look and operate like they mean it.
        </motion.p>
      </div>
    </section>
  );
}

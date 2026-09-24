"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export function AboutHero() {
  const reduce = useReducedMotion();

  return (
    <section className="ax-page-hero">
      <div className="ax-container">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="ax-kicker-pill">Company</p>
          <h1 className="ax-h1">
            Software with <em>serious craft.</em>
          </h1>
          <p className="ax-lead">
            Atheus builds SaaS products and fully custom websites for teams that want
            to look and operate like they mean it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.35,
  });

  if (reduce) return null;

  return (
    <motion.div
      className="ax-page-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

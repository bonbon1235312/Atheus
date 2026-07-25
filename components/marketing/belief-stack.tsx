"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export function BeliefStack({ lines }: { lines: string[] }) {
  const reduce = useReducedMotion();

  return (
    <section className="ax-section">
      <div className="ax-container">
        <motion.p
          className="ax-kicker-pill"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.55, ease }}
        >
          Beliefs
        </motion.p>

        <ul className="ax-belief-stack">
          {lines.map((line, index) => (
            <motion.li
              key={line}
              initial={
                reduce
                  ? false
                  : { opacity: 0, x: index % 2 === 0 ? -48 : 48, rotate: index % 2 === 0 ? -1.5 : 1.5 }
              }
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{ duration: 0.7, ease, delay: index * 0.08 }}
            >
              <span className="ax-belief-index">0{index + 1}</span>
              <p>{line}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

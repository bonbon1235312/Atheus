"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export function CascadeList({
  title,
  lead,
  items,
}: {
  title: string;
  lead: string;
  items: string[];
}) {
  const reduce = useReducedMotion();

  return (
    <section className="ax-section" style={{ paddingTop: 0 }}>
      <div className="ax-container ax-split">
        <div>
          <motion.h2
            className="ax-h2"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="ax-lead"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease, delay: 0.08 }}
          >
            {lead}
          </motion.p>
        </div>

        <ul className="ax-cascade-list">
          {items.map((item, index) => (
            <motion.li
              key={item}
              initial={reduce ? false : { opacity: 0, x: 40, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.55, ease, delay: index * 0.07 }}
            >
              <motion.span
                className="ax-cascade-line"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.55, ease, delay: 0.1 + index * 0.07 }}
                style={{ originX: 0 }}
                aria-hidden="true"
              />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

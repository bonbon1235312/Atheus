"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { AmbientField } from "@/components/marketing/ambient-field";
import { Magnetic } from "@/components/marketing/motion-primitives";
import { ScrambleText } from "@/components/marketing/scramble-text";

const ease = [0.22, 1, 0.36, 1] as const;

export function WowCta({
  title,
  lead,
  primary,
  secondary,
}: {
  title: string;
  lead: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  const reduce = useReducedMotion();

  return (
    <section className="ax-section" style={{ paddingTop: 0 }}>
      <div className="ax-container">
        <AmbientField className="ax-cta ax-sites-cta ax-cta-live">
          <motion.h2
            className="ax-h2"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease }}
          >
            <ScrambleText text={title} />
          </motion.h2>
          <motion.p
            className="ax-lead"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease, delay: 0.08 }}
          >
            {lead}
          </motion.p>
          <div className="ax-cta-actions">
            <Magnetic>
              <Link className="ax-btn ax-btn-primary ax-btn-icon" href={primary.href}>
                {primary.label}
                <span className="ax-btn-orb" aria-hidden="true">
                  →
                </span>
              </Link>
            </Magnetic>
            {secondary ? (
              <Magnetic strength={0.18}>
                <Link className="ax-btn ax-btn-secondary" href={secondary.href}>
                  {secondary.label}
                </Link>
              </Magnetic>
            ) : null}
          </div>
        </AmbientField>
      </div>
    </section>
  );
}

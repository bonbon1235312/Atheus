"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { Magnetic, SpotlightCard } from "@/components/marketing/motion-primitives";

const ease = [0.22, 1, 0.36, 1] as const;

export function ContactExperience() {
  const reduce = useReducedMotion();

  return (
    <>
      <section className="ax-page-hero">
        <div className="ax-container">
          <motion.p
            className="ax-kicker-pill"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
          >
            Start a project
          </motion.p>
          <h1 className="ax-h1 ax-display-split">
            <motion.span
              className="ax-line"
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.85, ease, delay: 0.05 }}
            >
              Tell us what you
            </motion.span>
            <span className="ax-line-mask">
              <motion.em
                initial={reduce ? false : { y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.9, ease, delay: 0.15 }}
              >
                need to run.
              </motion.em>
            </span>
          </h1>
          <motion.p
            className="ax-lead"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease, delay: 0.3 }}
          >
            Include context, timeline, and constraints. We reply with a direct next
            step.
          </motion.p>
        </div>
      </section>

      <section className="ax-section" style={{ paddingTop: 0 }}>
        <div className="ax-container ax-contact-grid">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.35 }}
          >
            <SpotlightCard>
              <div className="ax-contact-card">
                <h2 className="ax-h3">Email</h2>
                <p>
                  The fastest path for product access, partnerships, and project
                  enquiries. Include links if you have them.
                </p>
                <Magnetic>
                  <a
                    className="ax-btn ax-btn-primary ax-btn-icon"
                    href="mailto:hello@atheus.dev"
                  >
                    hello@atheus.dev
                    <span className="ax-btn-orb" aria-hidden="true">
                      →
                    </span>
                  </a>
                </Magnetic>
              </div>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.48 }}
          >
            <SpotlightCard>
              <div className="ax-contact-side">
                <h3 className="ax-h3">Product access</h3>
                <p>
                  For League, open the platform directly. For Sites, send a brief and we
                  will quote against scope. For Club or BlackWall, email us with your
                  organisation and use case.
                </p>
                <p style={{ marginTop: "1rem" }}>
                  <Link className="ax-text-link" href="/admin">
                    Platform sign in <span aria-hidden="true">→</span>
                  </Link>
                </p>
              </div>
            </SpotlightCard>
            <div style={{ height: "1rem" }} />
            <SpotlightCard>
              <div className="ax-contact-side">
                <h3 className="ax-h3">What to include</h3>
                <p>
                  Organisation name, the problem you need automated, current tools, and
                  whether you need a product or a custom build.
                </p>
              </div>
            </SpotlightCard>
            <div style={{ height: "1rem" }} />
            <SpotlightCard>
              <div className="ax-contact-side">
                <h3 className="ax-h3">Discord</h3>
                <p>
                  League Premium upgrades are handled on Discord during early access.
                </p>
                <p style={{ marginTop: "1rem" }}>
                  <a
                    className="ax-text-link"
                    href="https://discord.gg/dPrMMc82bf"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open Discord <span aria-hidden="true">→</span>
                  </a>
                </p>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </section>
    </>
  );
}

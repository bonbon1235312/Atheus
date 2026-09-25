"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export function ContactExperience() {
  const reduce = useReducedMotion();
  const enter = reduce ? false : { opacity: 0, y: 16 };

  return (
    <>
      <section className="ax-page-hero">
        <div className="ax-container">
          <motion.div
            initial={enter}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <p className="ax-kicker-pill">Start a project</p>
            <h1 className="ax-h1">
              Tell us what you <em>need to run.</em>
            </h1>
            <p className="ax-lead">
              Include context, timeline, and constraints. We reply with a direct next
              step.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="ax-section" style={{ paddingTop: 0 }}>
        <div className="ax-container ax-contact-grid">
          <div className="ax-contact-card">
            <h2 className="ax-h3">Email</h2>
            <p>
              The fastest path for product access, partnerships, and project
              enquiries. Include links if you have them.
            </p>
            <a className="ax-btn ax-btn-primary" href="mailto:hello@atheus.dev">
              hello@atheus.dev
            </a>
          </div>

          <div>
            <div className="ax-contact-side">
              <h3 className="ax-h3">Product access</h3>
              <p>
                For League, Sites, Club or BlackWall, email us with your
                organisation and use case. We’ll point you to the right next step.
              </p>
            </div>
            <div className="ax-contact-side">
              <h3 className="ax-h3">What to include</h3>
              <p>
                Organisation name, the problem you need automated, current tools, and
                whether you need a product or a custom build.
              </p>
            </div>
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
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export type StepItem = {
  title: string;
  body: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function StepMorph({
  kicker = "Process",
  title,
  lead,
  steps,
}: {
  kicker?: string;
  title: string;
  lead: string;
  steps: StepItem[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % steps.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [paused, reduce, steps.length]);

  const step = steps[active]!;

  return (
    <section className="ax-section">
      <div className="ax-container">
        <div className="ax-section-head">
          <p className="ax-kicker-pill">{kicker}</p>
          <h2 className="ax-h2">{title}</h2>
          <p className="ax-lead">{lead}</p>
        </div>

        <div
          className="ax-step-morph"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="ax-step-morph-tabs" role="tablist" aria-label={title}>
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={active === index}
                className="ax-step-morph-tab"
                data-active={active === index ? "true" : "false"}
                onClick={() => setActive(index)}
              >
                <span>0{index + 1}</span>
                {item.title}
                {active === index && !reduce ? (
                  <motion.i
                    className="ax-step-morph-ink"
                    layoutId="step-ink"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                ) : null}
              </button>
            ))}
          </div>

          <div className="ax-step-morph-stage" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.title}
                className="ax-step-morph-panel"
                initial={
                  reduce ? false : { opacity: 0, y: 28, filter: "blur(10px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  reduce
                    ? undefined
                    : { opacity: 0, y: -18, filter: "blur(8px)" }
                }
                transition={{ duration: 0.45, ease }}
              >
                <motion.span
                  className="ax-step-morph-num"
                  initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease }}
                >
                  0{active + 1}
                </motion.span>
                <h3 className="ax-h1">{step.title}</h3>
                <p>{step.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

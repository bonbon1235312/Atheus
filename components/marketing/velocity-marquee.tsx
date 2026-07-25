"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";

export function VelocityMarquee({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const base = useMotionValue(0);
  const x = useTransform(base, (v) => -v);
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...items, ...items, ...items];

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const v = velocity.get();
    const speed = 28 + Math.min(90, Math.abs(v) * 0.04);
    const direction = v > 40 ? 1 : v < -40 ? -1 : 1;
    let next = base.get() + (direction * speed * delta) / 1000;
    const width = trackRef.current?.scrollWidth ?? 1;
    const loop = width / 3;
    if (loop > 0) {
      if (next > loop) next -= loop;
      if (next < 0) next += loop;
    }
    base.set(next);
  });

  if (reduce) {
    return (
      <section className="ax-sites-marquee" aria-hidden="true">
        <div className="ax-sites-marquee-track">
          {items.concat(items).map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="ax-sites-marquee ax-velocity-marquee" aria-hidden="true">
      <motion.div className="ax-sites-marquee-track" ref={trackRef} style={{ x }}>
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`}>{item}</span>
        ))}
      </motion.div>
    </section>
  );
}

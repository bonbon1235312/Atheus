"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import {
  useCallback,
  type MouseEvent,
  type ReactNode,
} from "react";

export function AmbientField({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(50);
  const y = useMotionValue(40);
  const sx = useSpring(x, { stiffness: 80, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 80, damping: 22, mass: 0.4 });
  const glow = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(232,162,58,0.18), transparent 55%)`;

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (reduce) return;
      const rect = event.currentTarget.getBoundingClientRect();
      x.set(((event.clientX - rect.left) / rect.width) * 100);
      y.set(((event.clientY - rect.top) / rect.height) * 100);
    },
    [reduce, x, y],
  );

  return (
    <motion.div
      className={`ax-ambient ${className}`.trim()}
      style={{ backgroundImage: reduce ? undefined : glow }}
      onMouseMove={onMove}
    >
      {children}
    </motion.div>
  );
}

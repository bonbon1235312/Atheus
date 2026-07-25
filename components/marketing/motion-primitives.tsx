"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

const spring = { stiffness: 160, damping: 22, mass: 0.4 };

export function Magnetic({
  children,
  className = "",
  strength = 0.28,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (reduce) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      x.set(dx * strength);
      y.set(dy * strength);
    },
    [reduce, strength, x, y],
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const background = useMotionTemplate`
    radial-gradient(
      420px circle at ${x}% ${y}%,
      rgba(232, 162, 58, 0.18),
      transparent 42%
    )
  `;

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width) * 100);
    y.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <div
      ref={ref}
      className={`ax-spotlight ${className}`.trim()}
      onMouseMove={onMove}
    >
      {!reduce ? (
        <motion.div className="ax-spotlight-glow" style={{ background }} aria-hidden />
      ) : null}
      <div className="ax-spotlight-content">{children}</div>
    </div>
  );
}

export function useTilt(reduce: boolean | null) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), spring);
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), spring);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return { rx, ry, onMove, onLeave };
}

export function TiltFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { rx, ry, onMove, onLeave } = useTilt(reduce);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxLayer({
  children,
  value,
  className = "",
}: {
  children: ReactNode;
  value: MotionValue<number>;
  className?: string;
}) {
  return (
    <motion.div className={className} style={{ y: value }}>
      {children}
    </motion.div>
  );
}

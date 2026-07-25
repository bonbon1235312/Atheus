"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function ScrambleText({
  text,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "em" | "strong";
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (reduce || !playing) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const total = Math.max(12, text.length * 2);
    const id = window.setInterval(() => {
      frame += 1;
      const progress = frame / total;
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < text.length * progress) return text[index]!;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
          })
          .join(""),
      );
      if (frame >= total) {
        window.clearInterval(id);
        setDisplay(text);
        setPlaying(false);
      }
    }, 28);

    return () => window.clearInterval(id);
  }, [playing, reduce, text]);

  return (
    <Tag
      className={className}
      onMouseEnter={() => {
        if (!reduce) setPlaying(true);
      }}
    >
      <motion.span layout={false}>{display}</motion.span>
    </Tag>
  );
}

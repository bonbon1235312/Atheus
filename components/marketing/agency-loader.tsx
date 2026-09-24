"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const ROWS = 41;
const COLUMNS = 83;
const TEXT = "ATHEUS  /  DESIGN WITH INTENT  /  ";
const GLITCH = "ATHEUS/0123456789+*";

function makeGlyph(frame: number) {
  return Array.from({ length: ROWS }, (_, row) => {
    const progress = row / (ROWS - 1);
    const left = COLUMNS / 2 - 2 - progress * 33;
    const right = COLUMNS / 2 + 2 + progress * 33;
    const stroke = 3.5 + progress * 1.8;
    const visibleFrom = Math.max(0, ROWS - frame * 3);

    return Array.from({ length: COLUMNS }, (_, column) => {
      const inLeg = Math.abs(column - left) < stroke || Math.abs(column - right) < stroke;
      const inBar = row >= 24 && row <= 29 && column >= left && column <= right;
      if (row < visibleFrom || (!inLeg && !inBar)) return " ";

      const index = (row * 5 + column) % TEXT.length;
      const flicker = (row * 13 + column * 17 + frame * 11) % 37 === 0;
      return flicker && frame < 19 ? GLITCH[(row + column + frame) % GLITCH.length] : TEXT[index];
    }).join("");
  });
}

export function AgencyLoader() {
  const [frame, setFrame] = useState(0);
  const [complete, setComplete] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => makeGlyph(frame), [frame]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const nextFrame = window.requestAnimationFrame(() => setComplete(true));
      return () => window.cancelAnimationFrame(nextFrame);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let cancelled = false;
    let stopTimeline: (() => void) | undefined;

    void import("animejs").then(({ createTimeline, stagger }) => {
      if (cancelled || !loaderRef.current || !glyphRef.current || !titleRef.current) return;
      const counter = { value: 0 };
      const timeline = createTimeline({
        onComplete: () => {
          if (cancelled) return;
          document.body.style.overflow = previousOverflow;
          setComplete(true);
        },
      });

      timeline
        .add(counter, {
          value: 20,
          duration: 1150,
          ease: "linear",
          onUpdate: () => setFrame(Math.min(20, Math.round(counter.value))),
        }, 0)
        .add(glyphRef.current.querySelectorAll("span"), {
          opacity: [0.25, 1],
          duration: 360,
          delay: stagger(12, { from: "center" }),
          ease: "out(3)",
        }, 100)
        .add(titleRef.current, {
          opacity: [0, 1],
          y: [14, 0],
          duration: 520,
          ease: "out(3)",
        }, 1050)
        .add(loaderRef.current, {
          clipPath: ["inset(0 0 0 0)", "inset(0 0 100% 0)"],
          duration: 700,
          ease: "inOut(4)",
        }, 1650);

      stopTimeline = () => timeline.pause();
    }).catch(() => {
      if (cancelled) return;
      document.body.style.overflow = previousOverflow;
      setComplete(true);
    });

    return () => {
      cancelled = true;
      stopTimeline?.();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (complete) return null;

  return (
    <div className="agency-loader" ref={loaderRef} role="status" aria-label="Loading Atheus studio">
      <div className="agency-loader-top" aria-hidden="true"><span>ATHEUS / 001</span><span>DESIGN IN MOTION</span></div>
      <div className="agency-loader-center" aria-hidden="true">
        <div className="agency-loader-glyph" ref={glyphRef}>
          {lines.map((line, index) => <span key={index}>{line}</span>)}
        </div>
        <div className="agency-loader-title" ref={titleRef}>ATHEUS<span>.</span></div>
      </div>
      <div className="agency-loader-bottom" aria-hidden="true"><span>FORM &amp; FEEL</span><span>{String(Math.min(100, Math.round(frame / 20 * 100))).padStart(3, "0")}%</span></div>
    </div>
  );
}

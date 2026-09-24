"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import "./demo-intro.css";

type Brand = "hearth" | "ridgeway" | "northline";

const ROWS = 39;
const COLUMNS = 73;

const brands: Record<Brand, { name: string; kicker: string; detail: string; phrase: string }> = {
  hearth: {
    name: "Hearth & Co",
    kicker: "A slower kind of morning",
    detail: "Brewing the good stuff",
    phrase: "HEARTH & CO  /  COFFEE WORTH THE WALK  /  ",
  },
  ridgeway: {
    name: "RIDGEWAY CIVILS",
    kicker: "Plant / Earthworks / Civils",
    detail: "Preparing the ground",
    phrase: "RIDGEWAY / EARTHWORKS / BUILT ON SITE / ",
  },
  northline: {
    name: "NORTHLINE",
    kicker: "System check / 001",
    detail: "Powering on",
    phrase: "NORTHLINE  /  POWER ON  /  24 7  /  ",
  },
};

function inBolt(x: number, y: number) {
  const points = [
    [41, 0], [61, 0], [43, 15], [55, 15],
    [25, 38], [32, 21], [17, 21],
  ];
  let inside = false;
  for (let a = 0, b = points.length - 1; a < points.length; b = a++) {
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

function distanceToSegment(x: number, y: number, ax: number, ay: number, bx: number, by: number) {
  const lengthSquared = (bx - ax) ** 2 + (by - ay) ** 2;
  const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / lengthSquared));
  return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay));
}

function inDigger(x: number, y: number) {
  const track = ((x - 43) / 23) ** 2 + ((y - 34) / 4) ** 2 <= 1
    && !([29, 42, 55].some((wheel) => Math.hypot((x - wheel) / 2.5, y - 34) < 1));
  const chassis = y >= 28 && y <= 31 && x >= 25 && x <= 62;
  const engine = y >= 23 && y <= 28 && x >= 28 && x <= 43;
  const cab = y >= 17 && y <= 29 && x >= 43 && x <= 60
    && !(y >= 20 && y <= 24 && x >= 48 && x <= 56);
  const boom = distanceToSegment(x, y, 44, 19, 37, 6) < 2.5
    || distanceToSegment(x, y, 37, 6, 17, 10) < 2.2
    || distanceToSegment(x, y, 17, 10, 12, 24) < 2.2;
  const bucket = y >= 24 && y <= 29 && x >= 6 && x <= 17
    && x <= 17 - (y - 24) * 0.6;
  return track || chassis || engine || cab || boom || bucket;
}

function inShape(brand: Brand, x: number, y: number) {
  if (brand === "hearth") {
    const steam = y < 11 && [26, 36, 46].some((center, index) => Math.abs(x - center - Math.sin((y + index * 3) * 0.65) * 2) < 1.4);
    const rim = y >= 13 && y <= 15 && x >= 13 && x <= 55;
    const bowl = y > 15 && y < 32 && x >= 14 + (y - 15) * 0.43 && x <= 54 - (y - 15) * 0.43;
    const handle = y >= 17 && y <= 27 && x >= 54 && x <= 63 && (y < 20 || y > 24 || x >= 60);
    const saucer = y >= 33 && y <= 35 && x >= 15 && x <= 56;
    return steam || rim || bowl || handle || saucer;
  }
  if (brand === "ridgeway") return inDigger(x, y);
  return inBolt(x, y);
}

function makePattern(brand: Brand, frame: number) {
  const phrase = brands[brand].phrase;
  return Array.from({ length: ROWS }, (_, row) => {
    return Array.from({ length: COLUMNS }, (_, column) => {
      if (!inShape(brand, column, row)) return " ";
      const reveal = brand === "northline"
        ? column <= (frame / 20) * COLUMNS
        : row >= ROWS - (frame / 20) * ROWS;
      if (!reveal) return " ";
      const index = (row * 5 + column) % phrase.length;
      const glitch = (row * 11 + column * 7 + frame * 13) % 43 === 0;
      return glitch && frame < 17 ? "+/01"[(row + column + frame) % 4] : phrase[index];
    }).join("");
  });
}

export function DemoIntro({ brand }: { brand: Brand }) {
  const [frame, setFrame] = useState(0);
  const [complete, setComplete] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => makePattern(brand, frame), [brand, frame]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const nextFrame = window.requestAnimationFrame(() => setComplete(true));
      return () => window.cancelAnimationFrame(nextFrame);
    }

    const root = panelRef.current?.parentElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root?.classList.add("demo-intro-active");
    let cancelled = false;
    let stopTimeline: (() => void) | undefined;
    let disconnect: (() => void) | undefined;

    void import("animejs").then(({ animate, createTimeline, stagger }) => {
      if (cancelled || !panelRef.current || !glyphRef.current || !titleRef.current || !root) return;
      const counter = { value: 0 };
      const heroTargets = brand === "hearth"
        ? root.querySelectorAll(".hc-hero-copy h1, .hc-hero-copy p, .hc-hero-copy .hc-btn")
        : brand === "ridgeway"
          ? root.querySelectorAll(".rw-hero-copy .rw-eyebrow, .rw-hero-copy h1, .rw-hero-aside > p, .rw-hero-actions")
          : root.querySelectorAll(".nl-hero-copy h1, .nl-hero-copy p, .nl-hero-copy .nl-btn, .nl-hero-emergency");
      const heroImage = root.querySelector(
        brand === "hearth" ? ".hc-hero-image" : brand === "ridgeway" ? ".rw-hero-media img" : ".nl-hero-band img",
      );
      const timeline = createTimeline();

      timeline
        .add(counter, {
          value: 20,
          duration: brand === "hearth" ? 1250 : 1050,
          ease: "linear",
          onUpdate: () => setFrame(Math.min(20, Math.round(counter.value))),
        }, 0)
        .add(glyphRef.current.querySelectorAll("span"), {
          opacity: [0.3, 1],
          duration: 380,
          delay: stagger(12, { from: brand === "northline" ? "first" : "last" }),
          ease: "out(3)",
        }, 80)
        .add(titleRef.current, {
          opacity: [0, 1],
          y: [14, 0],
          duration: 500,
          ease: "out(3)",
        }, 1010)
        .add(heroTargets, {
          opacity: [0, 1],
          x: [brand === "northline" ? 20 : 0, 0],
          y: [brand === "hearth" ? 25 : brand === "ridgeway" ? 12 : 0, 0],
          duration: 670,
          delay: stagger(110),
          ease: "out(3)",
        }, 1710)
        .add(panelRef.current, {
          clipPath: ["inset(0 0 0 0)", brand === "northline" ? "inset(0 100% 0 0)" : "inset(0 0 100% 0)"],
          duration: 720,
          ease: "inOut(3)",
        }, 1580);

      if (scanRef.current && brand !== "hearth") {
        timeline.add(scanRef.current, { y: [0, "72vh"], opacity: [0, 1, 0], duration: 1130, ease: "linear" }, 120);
      }
      if (heroImage) {
        timeline.add(heroImage, {
          scale: [brand === "hearth" ? 1.1 : 1.06, 1],
          duration: brand === "hearth" ? 2200 : 1500,
          ease: "out(3)",
        }, 1500);
      }
      timeline.call(() => {
        if (cancelled) return;
        root.classList.remove("demo-intro-active");
        document.body.style.overflow = previousOverflow;
        setComplete(true);
      }, 2360);

      const revealTargets = root.querySelectorAll<HTMLElement>("[data-demo-reveal]");
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          observer.unobserve(target);
          animate(target, {
            opacity: [0, 1],
            y: [28, 0],
            duration: 900,
            ease: "out(3)",
          });
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
      revealTargets.forEach((target) => {
        target.style.opacity = "0";
        observer.observe(target);
      });
      disconnect = () => observer.disconnect();
      stopTimeline = () => timeline.pause();
    }).catch(() => {
      if (cancelled) return;
      root?.classList.remove("demo-intro-active");
      document.body.style.overflow = previousOverflow;
      setComplete(true);
    });

    return () => {
      cancelled = true;
      stopTimeline?.();
      disconnect?.();
      root?.classList.remove("demo-intro-active");
      document.body.style.overflow = previousOverflow;
    };
  }, [brand]);

  if (complete) return null;

  return (
    <div className={`demo-intro demo-intro--${brand}`} ref={panelRef} role="status" aria-label={`Loading ${brands[brand].name}`}>
      <div className="demo-intro-top" aria-hidden="true"><span>{brands[brand].name}</span><span>{brands[brand].kicker}</span></div>
      <div className="demo-intro-stage" aria-hidden="true">
        <div className="demo-intro-glyph" ref={glyphRef}>{lines.map((line, index) => <span key={index}>{line}</span>)}</div>
        <div className="demo-intro-title" ref={titleRef}>{brands[brand].name}</div>
      </div>
      <div className="demo-intro-scan" ref={scanRef} aria-hidden="true" />
      <div className="demo-intro-bottom" aria-hidden="true"><span>{brands[brand].detail}</span><span>{String(Math.round(frame / 20 * 100)).padStart(3, "0")}%</span></div>
    </div>
  );
}

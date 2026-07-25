"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const shots = [
  {
    src: "/brand/sites-river.jpg",
    alt: "Custom architecture studio website example",
    caption: "Rivermark Studio",
    href: "/demos/rivermark",
  },
  {
    src: "/brand/sites-showcase-2.jpg",
    alt: "Custom services and pricing website layout",
    caption: "Atelier",
    href: "/demos/atelier",
  },
  {
    src: "/brand/sites-hearth.jpg",
    alt: "Custom cafe website example",
    caption: "Hearth & Co",
    href: "/demos/hearth-co",
  },
];

function StaticShowcase() {
  return (
    <section className="ax-section">
      <div className="ax-container">
        <div className="ax-section-head ax-section-head-center">
          <h2 className="ax-h2">Built to look expensive</h2>
          <p className="ax-lead">
            Show someone your site and watch the room change. That is the bar.
          </p>
        </div>
        <div className="ax-showcase-bento">
          <div className="ax-showcase-main">
            <Link className="ax-bezel" href={shots[0].href}>
              <div className="ax-bezel-inner">
                <Image
                  src={shots[0].src}
                  alt={shots[0].alt}
                  width={1600}
                  height={900}
                  sizes="(max-width: 960px) 100vw, 65vw"
                />
              </div>
            </Link>
            <p>
              <Link href={shots[0].href}>{shots[0].caption} →</Link>
            </p>
          </div>
          <div className="ax-showcase-stack">
            {shots.slice(1).map((shot) => (
              <div key={shot.src}>
                <Link className="ax-bezel" href={shot.href}>
                  <div className="ax-bezel-inner">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={1600}
                      height={900}
                      sizes="(max-width: 960px) 100vw, 32vw"
                    />
                  </div>
                </Link>
                <p>
                  <Link href={shot.href}>{shot.caption} →</Link>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ScrollShowcase() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.35,
  });

  // Solid deck: each next card slides up fully opaque and covers the one below.
  const y1 = useTransform(progress, [0.12, 0.38], ["108%", "0%"]);
  const y2 = useTransform(progress, [0.45, 0.72], ["108%", "0%"]);
  const scale0 = useTransform(progress, [0.12, 0.38, 0.45, 0.72], [1, 0.94, 0.94, 0.9]);
  const scale1 = useTransform(progress, [0.45, 0.72], [1, 0.94]);
  const bar = useTransform(progress, [0, 1], ["0%", "100%"]);

  const c0 = useTransform(progress, [0, 0.2, 0.32], [1, 1, 0]);
  const c1 = useTransform(progress, [0.2, 0.32, 0.55, 0.68], [0, 1, 1, 0]);
  const c2 = useTransform(progress, [0.55, 0.68, 1], [0, 1, 1]);

  if (reduce) {
    return <StaticShowcase />;
  }

  return (
    <section className="ax-scroll-showcase" ref={ref}>
      <div className="ax-scroll-showcase-sticky">
        <div className="ax-container">
          <div className="ax-section-head ax-section-head-center">
            <h2 className="ax-h2">Built to look expensive</h2>
            <p className="ax-lead">
              Scroll through the craft. This is the standard we build to.
            </p>
            <div className="ax-scroll-progress" aria-hidden="true">
              <motion.span style={{ width: bar }} />
            </div>
          </div>

          <div className="ax-scroll-stage">
            <motion.article
              className="ax-scroll-slide"
              style={{ scale: scale0, zIndex: 1 }}
            >
              <SlideFrame shot={shots[0]} />
            </motion.article>

            <motion.article
              className="ax-scroll-slide"
              style={{ y: y1, scale: scale1, zIndex: 2 }}
            >
              <SlideFrame shot={shots[1]} />
            </motion.article>

            <motion.article className="ax-scroll-slide" style={{ y: y2, zIndex: 3 }}>
              <SlideFrame shot={shots[2]} />
            </motion.article>
          </div>

          <div className="ax-scroll-caption-wrap" aria-live="polite">
            <Caption opacity={c0} text={shots[0].caption} href={shots[0].href} />
            <Caption opacity={c1} text={shots[1].caption} href={shots[1].href} />
            <Caption opacity={c2} text={shots[2].caption} href={shots[2].href} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SlideFrame({
  shot,
}: {
  shot: (typeof shots)[number];
}) {
  return (
    <Link
      className="ax-bezel ax-bezel-glow"
      href={shot.href}
      aria-label={`Open live demo: ${shot.caption}`}
    >
      <div className="ax-bezel-inner">
        <Image
          src={shot.src}
          alt={shot.alt}
          width={1600}
          height={900}
          sizes="(max-width: 960px) 100vw, 820px"
        />
      </div>
    </Link>
  );
}

function Caption({
  opacity,
  text,
  href,
}: {
  opacity: MotionValue<number>;
  text: string;
  href: string;
}) {
  return (
    <motion.p className="ax-scroll-caption" style={{ opacity }}>
      <Link href={href}>{text} →</Link>
    </motion.p>
  );
}

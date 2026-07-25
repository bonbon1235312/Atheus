"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const tiles = [
  {
    src: "/brand/sites-hearth.jpg",
    label: "Hearth & Co",
    copy: "Warm, sharp, unmistakably theirs.",
    span: "wide",
    href: "/demos/hearth-co",
  },
  {
    src: "/brand/sites-river.jpg",
    label: "Rivermark Studio",
    copy: "Editorial layouts that feel commissioned.",
    span: "tall",
    href: "/demos/rivermark",
  },
  {
    src: "/brand/sites-showcase-2.jpg",
    label: "Atelier",
    copy: "Pricing and proof that convert.",
    span: "base",
    href: "/demos/atelier",
  },
  {
    src: "/brand/league-product.png",
    label: "Products",
    copy: "Software with the same bar.",
    span: "base",
    href: "/products",
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function ProofMosaic() {
  const reduce = useReducedMotion();

  return (
    <section className="ax-section">
      <div className="ax-container">
        <div className="ax-section-head ax-section-head-center">
          <h2 className="ax-h2">Work that travels</h2>
          <p className="ax-lead">
            Live demo sites on their own subdomains — open them and feel the craft.
          </p>
        </div>

        <div className="ax-proof-mosaic">
          {tiles.map((tile, index) => (
            <motion.figure
              key={tile.label}
              className="ax-proof-tile"
              data-span={tile.span}
              initial={
                reduce
                  ? false
                  : {
                      opacity: 0,
                      y: 36,
                      clipPath: "inset(18% 18% 18% 18% round 24px)",
                    }
              }
              whileInView={{
                opacity: 1,
                y: 0,
                clipPath: "inset(0% 0% 0% 0% round 24px)",
              }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.85, ease, delay: index * 0.08 }}
              whileHover={reduce ? undefined : { y: -6 }}
            >
              <Link className="ax-proof-tile-link" href={tile.href} aria-label={`Open ${tile.label}`}>
                <div className="ax-bezel">
                  <div className="ax-bezel-inner">
                    <Image
                      src={tile.src}
                      alt=""
                      width={1400}
                      height={900}
                      sizes="(max-width: 900px) 100vw, 40vw"
                    />
                  </div>
                </div>
              </Link>
              <figcaption>
                <strong>
                  <Link href={tile.href}>{tile.label}</Link>
                </strong>
                <span>{tile.copy}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { animate, stagger } from "animejs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const services = [
  {
    id: "commercial",
    label: "Commercial fit-outs",
    title: "Offices, retail, and plant rooms",
    body: "First and second fix, lighting, data containment, and testing for occupied buildings. We work to your programme, not ours.",
    image: "/brand/northline-fitout.jpg",
    alt: "White commercial ceiling with LED panels during a fit-out",
  },
  {
    id: "ev",
    label: "EV charging",
    title: "Workplace and fleet chargers",
    body: "Survey, supply, and commission. Single posts or a full car park, with load management where the incoming supply needs it.",
    image: "/brand/northline-ev.jpg",
    alt: "EV charging bays in a commercial car park",
  },
  {
    id: "domestic",
    label: "Domestic wiring",
    title: "Rewires, boards, and extensions",
    body: "Consumer units, kitchen circuits, and full rewires. NICEIC paperwork included. We leave the job tidy.",
    image: "/brand/northline-consumer.jpg",
    alt: "Neatly installed domestic consumer unit on a white wall",
  },
] as const;

type ServiceId = (typeof services)[number]["id"];

export function ServiceSelector() {
  const [active, setActive] = useState<ServiceId>("commercial");
  const panelRef = useRef<HTMLDivElement>(null);
  const current = services.find((service) => service.id === active) ?? services[0];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !panelRef.current) return;
    const copy = panelRef.current.querySelectorAll(".nl-service-copy > *");
    const image = panelRef.current.querySelector(".nl-service-media img");
    const textAnimation = animate(copy, { opacity: [0, 1], x: [-16, 0], delay: stagger(65), duration: 430, ease: "out(3)" });
    const imageAnimation = image ? animate(image, { opacity: [0.55, 1], scale: [1.055, 1], duration: 560, ease: "out(3)" }) : null;
    return () => { textAnimation.pause(); imageAnimation?.pause(); };
  }, [active]);

  return (
    <div className="nl-services">
      <div className="nl-service-switch" role="tablist" aria-label="Services">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            role="tab"
            aria-selected={active === service.id}
            className={active === service.id ? "is-active" : undefined}
            onClick={() => setActive(service.id)}
          >
            {service.label}
          </button>
        ))}
      </div>

      <div className="nl-service-panel" role="tabpanel" ref={panelRef}>
        <div className="nl-service-copy">
          <h3>{current.title}</h3>
          <p>{current.body}</p>
          <a className="nl-text-link" href="#quote">
            Request a quote
          </a>
        </div>
        <div className="nl-service-media">
          <Image
            src={current.image}
            alt={current.alt}
            width={1200}
            height={900}
            sizes="(max-width: 900px) 100vw, 52vw"
          />
        </div>
      </div>
    </div>
  );
}

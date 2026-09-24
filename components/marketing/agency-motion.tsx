"use client";

import { useEffect, useRef } from "react";

export function AgencyMotion() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".agency-reveal"));
    const gallery = document.querySelector<HTMLElement>(".agency-hero-gallery");
    const projects = Array.from(document.querySelectorAll<HTMLElement>(".agency-project-image"));
    const services = document.querySelector<HTMLElement>(".agency-service-list");
    const asterisk = document.querySelector<HTMLElement>(".agency-asterisk");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
    );

    reveals.forEach((element) => observer.observe(element));
    root.classList.add("agency-motion-ready");

    let frame = 0;
    const update = () => {
      frame = 0;
      const compact = window.innerWidth < 760;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;

      if (gallery) {
        const bounds = gallery.getBoundingClientRect();
        const amount = Math.min(1, Math.max(-1,
          (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) / ((window.innerHeight + bounds.height) / 2),
        ));
        gallery.style.setProperty("--gallery-main-shift", `${(amount * (compact ? 15 : 26)).toFixed(1)}px`);
        gallery.style.setProperty("--gallery-side-shift", `${(amount * (compact ? -22 : -42)).toFixed(1)}px`);
        gallery.style.setProperty("--gallery-stamp-turn", `${(amount * 13).toFixed(1)}deg`);
      }

      projects.forEach((project, index) => {
        const bounds = project.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
        const amount = Math.min(1, Math.max(-1,
          (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) / ((window.innerHeight + bounds.height) / 2),
        ));
        project.style.setProperty("--project-image-shift", `${(amount * (compact ? 16 : index === 1 ? -24 : 30)).toFixed(1)}px`);
      });

      if (services) {
        const bounds = services.getBoundingClientRect();
        const amount = Math.min(1, Math.max(0, (window.innerHeight * 0.62 - bounds.top) / bounds.height));
        services.style.setProperty("--services-progress", amount.toFixed(3));
      }
      if (asterisk) {
        const bounds = asterisk.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > 0) {
          const amount = (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height);
          asterisk.style.setProperty("--asterisk-turn", `${(amount * 70 - 35).toFixed(1)}deg`);
        }
      }
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("agency-motion-ready");
    };
  }, []);

  return <div className="agency-scroll-progress" ref={progressRef} aria-hidden="true" />;
}

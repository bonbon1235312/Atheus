"use client";

import { useEffect, type ReactNode } from "react";

export function HomeExperience({ children }: { children: ReactNode }) {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".landing-page");
    const hero = document.querySelector<HTMLElement>(".hero");
    const operationsStory =
      document.querySelector<HTMLElement>(".operations-story");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    page?.classList.add("is-motion-ready");

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealElements.forEach((element, index) => {
      element.style.setProperty("--reveal-order", String(index % 4));
      revealObserver.observe(element);
    });

    const counters = Array.from(
      document.querySelectorAll<HTMLElement>("[data-counter]"),
    );
    const counterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          const target = Number(element.dataset.counter ?? 0);
          const suffix = element.dataset.counterSuffix ?? "";

          if (reducedMotion || target === 0) {
            element.textContent = `${target}${suffix}`;
          } else {
            const startedAt = performance.now();
            const duration = 900;
            const tick = (now: number) => {
              const progress = Math.min((now - startedAt) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              element.textContent = `${Math.round(target * eased)}${suffix}`;
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
          counterObserver.unobserve(element);
        }
      },
      { threshold: 0.55 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));

    const steps = Array.from(
      document.querySelectorAll<HTMLElement>("[data-operation-step]"),
    );
    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      if (!page || !hero || reducedMotion) return;
      const heroRect = hero.getBoundingClientRect();
      const progress = Math.min(
        Math.max(-heroRect.top / Math.max(heroRect.height, 1), 0),
        1,
      );
      page.style.setProperty("--hero-progress", progress.toFixed(3));
      page.style.setProperty(
        "--page-progress",
        (
          window.scrollY /
          Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
        ).toFixed(3),
      );

      if (operationsStory && steps.length > 0) {
        const storyRect = operationsStory.getBoundingClientRect();
        const travel = Math.max(storyRect.height - window.innerHeight, 1);
        const storyProgress = Math.min(Math.max(-storyRect.top / travel, 0), 1);
        const activeIndex = Math.min(
          steps.length - 1,
          Math.floor(storyProgress * steps.length),
        );
        steps.forEach((step, index) => {
          step.classList.toggle("is-current", index === activeIndex);
        });
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return children;
}

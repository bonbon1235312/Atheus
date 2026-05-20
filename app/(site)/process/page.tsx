import type { Metadata } from "next";
import Link from "next/link";
import { MotionReveal } from "@/components/site/motion-reveal";

export const metadata: Metadata = {
  title: "Process",
  description: "The ATHEUS web design and development process from discovery to support.",
};

const steps = [
  {
    number: "01",
    title: "Discovery",
    copy: "We define the business, audience, offer, current blockers, and what the website must help people do.",
  },
  {
    number: "02",
    title: "Direction",
    copy: "We set the creative route: visual identity, page structure, copy tone, conversion goals, and key user journeys.",
  },
  {
    number: "03",
    title: "Build",
    copy: "The site is developed in Next.js with responsive layouts, accessible UI, careful animation, and clean components.",
  },
  {
    number: "04",
    title: "Launch",
    copy: "We connect the domain, metadata, analytics-ready structure, forms, deployment, and final polish for Vercel.",
  },
  {
    number: "05",
    title: "Support",
    copy: "After launch, clients can choose managed hosting, updates, minor edits, or a clean self-hosted handover.",
  },
];

export default function ProcessPage() {
  return (
    <main>
      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Process</p>
            <h1 className="type-display mt-4 max-w-5xl text-6xl font-semibold leading-none sm:text-7xl md:text-8xl">
              A clear route from first conversation to a live website.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-chalk/68">
              The process is intentionally compact. Strategy first, design with
              a point of view, then a clean frontend build that is ready to ship.
            </p>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-graphite">
        <div className="container-studio">
          <div className="grid gap-0">
            {steps.map((step, index) => (
              <MotionReveal key={step.title} delay={index * 0.04}>
                <article className="grid gap-5 border-t border-white/12 py-8 md:grid-cols-[120px_0.8fr_1.2fr]">
                  <p className="text-2xl font-black text-acid">{step.number}</p>
                  <h2 className="type-display text-5xl font-semibold leading-none">
                    {step.title}
                  </h2>
                  <p className="text-lg text-chalk/68">{step.copy}</p>
                </article>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio studio-card p-6">
          <MotionReveal>
            <p className="kicker">Fit</p>
            <h2 className="type-display mt-3 max-w-3xl text-5xl font-semibold leading-none md:text-6xl">
              Best for businesses that want direction, not just decoration.
            </h2>
            <p className="mt-5 max-w-2xl text-chalk/68">
              ATHEUS works best with independent businesses that know the site
              needs to feel credible, useful, and ownable. The project starts
              with clarity, because the visuals only work when the offer is
              clear.
            </p>
            <Link href="/contact" className="studio-button studio-button-primary mt-8">
              Start a project
            </Link>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}

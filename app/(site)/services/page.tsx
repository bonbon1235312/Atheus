import type { Metadata } from "next";
import Link from "next/link";
import { MotionReveal } from "@/components/site/motion-reveal";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website design, frontend development, landing pages, hospitality websites, trade websites, and ongoing website support from ATHEUS.",
};

const services = [
  {
    number: "01",
    title: "Website design",
    copy: "Identity, page structure, visual direction and conversion-focused layouts for businesses that need a site with a point of view.",
    tag: "Design + UX",
  },
  {
    number: "02",
    title: "Frontend development",
    copy: "Responsive, accessible builds in Next.js with polished motion, clean components and production-ready code.",
    tag: "Engineering",
  },
  {
    number: "03",
    title: "Landing pages",
    copy: "Focused launch, campaign, waitlist and offer pages built around one clear action and one strong above-the-fold moment.",
    tag: "Campaign",
  },
  {
    number: "04",
    title: "Hospitality websites",
    copy: "Restaurant, café, bar and venue sites with menus, booking journeys, opening information and brand atmosphere.",
    tag: "Hospitality",
  },
  {
    number: "05",
    title: "Trade / local business websites",
    copy: "Credible service sites for independent trades where trust, clarity and enquiry volume are the whole job.",
    tag: "Trade",
  },
  {
    number: "06",
    title: "Portfolio &amp; campaign pages",
    copy: "High-impact pages for makers, founders, launches, drops and short-run campaigns.",
    tag: "Portfolio",
  },
  {
    number: "07",
    title: "Website care &amp; support",
    copy: "Ongoing support, managed hosting, minor edits, monitoring and clear ownership after launch.",
    tag: "Care",
  },
];

export default function ServicesPage() {
  return (
    <main>
      <section className="section-pad">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <MotionReveal>
            <p className="kicker">Services</p>
            <h1 className="type-display mt-4 text-6xl font-semibold leading-[0.95] sm:text-7xl md:text-8xl">
              Creative direction <em className="text-acid">and</em> frontend build, under one roof.
            </h1>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <p className="max-w-2xl text-xl leading-relaxed text-chalk/72">
              ATHEUS is built for independent businesses that need more than a template and less than a slow agency process. The work pairs brand direction, copy structure, responsive design and production frontend delivery — written by one person, signed off by one person.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/work" className="studio-button studio-button-secondary">
                View work
              </Link>
              <Link href="/contact" className="studio-button studio-button-primary">
                Discuss a project
              </Link>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad border-y border-white/10">
        <div className="container-studio">
          <MotionReveal className="grid gap-6 md:grid-cols-[0.6fr_1.4fr] md:items-end">
            <p className="kicker">The work</p>
            <p className="max-w-2xl text-lg text-chalk/65 md:justify-self-end">
              Engagements are scoped to outcomes, not hours. Indicative rates and timelines are shared on the first call.
            </p>
          </MotionReveal>

          <ol className="mt-10">
            {services.map((service, index) => (
              <MotionReveal key={service.title} delay={index * 0.035}>
                <li className="rate-row">
                  <span className="rate-row-index">{service.number}</span>
                  <div>
                    <h2 className="rate-row-title" dangerouslySetInnerHTML={{ __html: service.title }} />
                    <p className="rate-row-copy" dangerouslySetInnerHTML={{ __html: service.copy }} />
                  </div>
                  <span className="rate-row-tag">{service.tag}</span>
                </li>
              </MotionReveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad bg-chalk text-ink">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="font-black uppercase text-flare">After launch</p>
            <h2 className="type-display mt-3 text-5xl font-semibold leading-[1.0] md:text-7xl">
              Managed when useful. <em>Portable when preferred.</em>
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="studio-card-light p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">Option A</p>
                <h3 className="mt-3 text-2xl font-black">Managed through ATHEUS</h3>
                <p className="mt-3 text-black/70">
                  For clients who want the site handled after launch: hosting, updates, minor edits and support stay with the studio. Monthly retainer.
                </p>
              </div>
              <div className="studio-card-light p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">Option B</p>
                <h3 className="mt-3 text-2xl font-black">Client-owned handover</h3>
                <p className="mt-3 text-black/70">
                  For clients who want full ownership: the site is handed over with clear access, documentation and launch guidance. No lock-in.
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-xl text-lg text-black/68">
              The tone stays premium because the work should be something both sides are proud to show.
            </p>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}

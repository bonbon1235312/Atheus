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
    title: "Website design",
    copy: "Design systems, page structure, visual direction, and conversion-focused layouts for businesses that need a site with identity.",
  },
  {
    title: "Frontend development",
    copy: "Responsive, accessible frontend builds with polished motion, clean component structure, and production-ready code.",
  },
  {
    title: "Landing pages",
    copy: "Focused launch, campaign, waitlist, and offer pages built around one clear action.",
  },
  {
    title: "Hospitality websites",
    copy: "Restaurant, cafe, bar, and venue websites with menus, booking journeys, opening information, and brand atmosphere.",
  },
  {
    title: "Trade/local business websites",
    copy: "Credible service websites for independent businesses where trust, clarity, and enquiry volume matter.",
  },
  {
    title: "Portfolio/campaign pages",
    copy: "High-impact pages for makers, creators, founders, launches, drops, and short-term campaigns.",
  },
  {
    title: "Website care/support",
    copy: "Ongoing support, managed hosting options, minor edits, monitoring, and clear ownership after launch.",
  },
];

export default function ServicesPage() {
  return (
    <main>
      <section className="section-pad">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="kicker">Services</p>
            <h1 className="type-display mt-4 text-7xl font-semibold leading-none md:text-8xl">
              Creative direction and frontend build, under one roof.
            </h1>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <p className="max-w-2xl text-xl leading-relaxed text-chalk/70">
              ATHEUS is built for independent businesses that need more than a
              template and less than a slow agency process. The work combines
              brand direction, copy structure, responsive design, and production
              frontend delivery.
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

      <section className="section-pad border-y border-white/10 bg-graphite">
        <div className="container-studio grid gap-4 md:grid-cols-2">
          {services.map((service, index) => (
            <MotionReveal key={service.title} delay={index * 0.03}>
              <article className="studio-card min-h-48 p-5">
                <p className="font-black text-acid">0{index + 1}</p>
                <h2 className="mt-5 text-3xl font-black">{service.title}</h2>
                <p className="mt-4 text-chalk/66">{service.copy}</p>
              </article>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="section-pad bg-chalk text-ink">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="font-black text-flare">After launch</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">
              Managed when useful. Portable when preferred.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="studio-card-light p-5">
                <h3 className="text-2xl font-black">Managed through ATHEUS</h3>
                <p className="mt-3 text-black/68">
                  For clients who want the website handled after launch: hosting,
                  updates, minor edits, and support can stay with ATHEUS.
                </p>
              </div>
              <div className="studio-card-light p-5">
                <h3 className="text-2xl font-black">Client-owned handover</h3>
                <p className="mt-3 text-black/68">
                  For clients who want full ownership: the site can be handed
                  over with clear access, documentation, and launch guidance.
                </p>
              </div>
            </div>
            <p className="mt-6 text-lg text-black/68">
              Selected launch projects are available for independent businesses
              that fit the studio. The tone stays premium because the work
              should be something both sides are proud to show.
            </p>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}

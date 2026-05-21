import Link from "next/link";
import { MotionReveal } from "@/components/site/motion-reveal";
import { featuredProjects } from "@/lib/projects";

const studioPrinciples = [
  [
    "01",
    "Identity first, layout second.",
    "Every site is built around what the business actually is, not which template fits the industry. The interface comes after the voice.",
  ],
  [
    "02",
    "Motion with a reason.",
    "Animation guides attention or signals craft. It does not paper over weak content. If a section moves, it moves to make a point.",
  ],
  [
    "03",
    "Conversion without pressure.",
    "Enquiry should feel obvious, premium and easy. The work earns the lead; the site doesn't beg for it.",
  ],
];

const serviceLines = [
  ["Portfolio websites", "Independent makers & studios"],
  ["Lead generation sites", "Service businesses"],
  ["Hospitality websites", "Restaurants, cafés, bars"],
  ["Trade & local business", "Trades, professionals"],
  ["Campaign &amp; launch pages", "Drops, waitlists, offers"],
  ["Frontend builds", "Design partners, founders"],
];

export default function Home() {
  return (
    <main>
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
        <div className="hero-scene" aria-hidden="true" />
        <div className="container-studio relative grid min-h-[calc(100vh-80px)] content-between gap-16 pb-12 pt-24">
          <MotionReveal className="grid gap-8">
            <div className="flex flex-wrap items-center justify-between gap-5 border-y border-white/15 py-4 text-xs font-black uppercase tracking-[0.18em] text-chalk/72">
              <span>atheus.dev</span>
              <span className="hidden md:inline">Identity · Frontend · Hospitality · Trade</span>
              <span>Independent businesses</span>
            </div>

            <div className="hero-index">
              <p className="hero-sideways">STUDIO</p>
              <div>
                <h1 className="hero-title-xl">ATHEUS</h1>
                <p className="type-display mt-7 max-w-3xl text-3xl font-medium leading-tight text-chalk md:text-5xl">
                  Websites with identity, <em className="italic text-acid">built to feel intentional.</em>
                </p>
                <p className="mt-6 max-w-2xl text-lg text-chalk/72">
                  A small creative studio building sharp digital identities for independent businesses — full portfolio sites, service-led websites and high-converting demos with enough character to be remembered.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/work" className="studio-button studio-button-primary">
                    Enter the work
                  </Link>
                  <Link href="/contact" className="studio-button studio-button-secondary">
                    Start a project
                  </Link>
                </div>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.1}>
            <div className="grid gap-3 md:grid-cols-3">
              {studioPrinciples.map(([number, title, copy]) => (
                <div key={title} className="border-t border-white/18 pt-4">
                  <p className="text-sm font-black text-acid">{number}</p>
                  <h2 className="type-display mt-3 text-2xl font-semibold leading-tight md:text-3xl">{title}</h2>
                  <p className="mt-3 text-chalk/65">{copy}</p>
                </div>
              ))}
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="studio-slab py-5 text-chalk">
        <div className="overflow-hidden">
          <div className="marquee-track">
            {[...Array(2)].map((_, group) => (
              <div key={group} className="flex min-w-max gap-12 pr-12 text-xl font-black uppercase tracking-tight">
                <span>Hawthorne Electrical</span>
                <span className="text-acid">·</span>
                <span>Saplings</span>
                <span className="text-acid">·</span>
                <span>Forge House</span>
                <span className="text-acid">·</span>
                <span>Cinder &amp; Clover</span>
                <span className="text-acid">·</span>
                <span>Four directions, one studio</span>
                <span className="text-acid">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal className="grid gap-6 md:grid-cols-[0.72fr_1.28fr] md:items-end">
            <div>
              <p className="kicker">Work wall</p>
              <h2 className="type-display mt-4 text-6xl font-semibold leading-[0.95] md:text-8xl">
                Four live directions.
              </h2>
            </div>
            <p className="max-w-2xl text-xl text-chalk/68 md:justify-self-end">
              The portfolio is built to sell the studio by showing complete, navigable website directions. No mood-board fluff, no generic agency thumbnails, no same-site syndrome.
            </p>
          </MotionReveal>

          <div className="portfolio-wall mt-12">
            {featuredProjects.map((project, index) => (
              <MotionReveal key={project.slug} delay={index * 0.035}>
                <Link href={`/work/${project.slug}`} className="project-row group">
                  <div>
                    <p className="project-row-index">
                      0{index + 1} <span className="text-chalk/40">/</span> {project.industry}
                    </p>
                    <p className="mt-3 text-sm text-chalk/55">{project.keyLine}</p>
                  </div>
                  <h3 className="project-row-title transition-colors group-hover:text-acid">
                    {project.name}
                  </h3>
                  <span className="project-row-chip transition-colors group-hover:border-acid group-hover:text-acid">
                    View case →
                  </span>
                </Link>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-chalk text-ink">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="font-black uppercase tracking-[0.2em] text-flare">Studio position</p>
            <h2 className="type-display mt-4 text-5xl font-semibold leading-[0.98] md:text-8xl">
              This is not a catalogue of templates.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <div className="grid gap-6 text-xl leading-relaxed text-black/74">
              <p>
                ATHEUS exists to make independent businesses feel designed with intent. The work is cinematic without being vague, minimal without being empty, and commercial without becoming loud.
              </p>
              <p>
                Each portfolio piece is built as a complete website direction: brand logic, copy, layout, motion, responsive behaviour and a clear route to enquiry or booking.
              </p>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="kicker">Output</p>
              <h2 className="type-display mt-4 text-6xl font-semibold leading-[0.95] md:text-7xl">
                What the studio builds.
              </h2>
            </div>
            <p className="max-w-xl text-lg text-chalk/65 md:justify-self-end">
              Six things, done properly. Engagements are scoped to outcomes, not hours.
            </p>
          </MotionReveal>

          <div className="mt-12 grid gap-px bg-white/12 md:grid-cols-2">
            {serviceLines.map(([service, audience]) => (
              <Link
                key={service}
                href="/services"
                className="group flex flex-col justify-between bg-ink p-6 transition-colors hover:bg-acid hover:text-ink"
              >
                <span
                  className="text-2xl font-black"
                  dangerouslySetInnerHTML={{ __html: service }}
                />
                <div className="mt-8 flex items-end justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-chalk/55 group-hover:text-ink/60">
                    {audience}
                  </span>
                  <span className="studio-link text-sm">Details</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-graphite">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Artifacts</p>
            <h2 className="type-display mt-4 max-w-4xl text-6xl font-semibold leading-[0.95] md:text-8xl">
              Design should leave evidence.
            </h2>
          </MotionReveal>

          <MotionReveal className="artifact-strip mt-12" delay={0.08}>
            <div className="artifact-cell artifact-a">
              <span className="artifact-label">First-screen offer · enquiry path</span>
            </div>
            <div className="artifact-cell artifact-b">
              <span className="artifact-label">Motion as a rule</span>
            </div>
            <div className="artifact-cell artifact-c">
              <span className="artifact-label">Responsive case studies</span>
            </div>
            <div className="artifact-cell artifact-d">
              <span className="artifact-label text-chalk/80">Typography with pressure</span>
            </div>
            <div className="artifact-cell artifact-e">
              <span className="artifact-label text-chalk/80">A portfolio alive before anyone clicks contact</span>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio grid gap-8 border-y border-white/15 py-12 md:grid-cols-[1.1fr_auto] md:items-center">
          <MotionReveal>
            <p className="kicker">Lead site</p>
            <h2 className="type-display mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] md:text-8xl">
              The site itself is the first <em className="italic text-acid">proof of the work.</em>
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-chalk/68">
              Strong enough to impress a client, clear enough to win trust, sharp enough to separate the studio from the demo brands it contains.
            </p>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <Link href="/contact" className="studio-button studio-button-primary">
              Start a project
            </Link>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { MotionReveal } from "@/components/site/motion-reveal";
import { featuredProjects } from "@/lib/projects";

const studioPrinciples = [
  ["01", "Identity before layout", "Every build starts with the business feeling unmistakable, then the interface follows."],
  ["02", "Motion with restraint", "Movement is used to guide attention and signal craft, never to decorate weak content."],
  ["03", "Conversion without desperation", "The site should make enquiry feel natural, premium, and easy to act on."],
];

const serviceLines = [
  "Portfolio websites",
  "Lead generation sites",
  "Hospitality websites",
  "Trade/local business sites",
  "Campaign pages",
  "Frontend builds",
];

export default function Home() {
  return (
    <main>
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
        <div className="hero-scene" aria-hidden="true" />
        <div className="container-studio relative grid min-h-[calc(100vh-80px)] content-between gap-16 pb-12 pt-24">
          <MotionReveal className="grid gap-8">
            <div className="flex flex-wrap items-center justify-between gap-5 border-y border-white/15 py-4 text-sm font-black uppercase text-chalk/72">
              <span>atheus.dev</span>
              <span>Portfolio systems / lead sites / live demos</span>
              <span>Independent businesses</span>
            </div>

            <div className="hero-index">
              <p className="hero-sideways">STUDIO</p>
              <div>
                <h1 className="hero-title-xl">ATHEUS</h1>
                <p className="mt-7 max-w-3xl text-3xl font-semibold leading-tight text-chalk md:text-5xl">
                  Websites with identity, built to feel intentional.
                </p>
                <p className="mt-6 max-w-2xl text-lg text-chalk/68">
                  ATHEUS is the lead site and portfolio hub for a creative web
                  studio building sharp digital identities for independent
                  businesses: full portfolio sites, service-led websites, and
                  high-converting demo concepts with enough character to be
                  remembered.
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
                  <h2 className="mt-3 text-2xl font-black">{title}</h2>
                  <p className="mt-3 text-chalk/62">{copy}</p>
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
              <div key={group} className="flex min-w-max gap-12 pr-12 text-xl font-black uppercase">
                <span>Identity systems</span>
                <span>Live case studies</span>
                <span>Editorial layouts</span>
                <span>Conversion paths</span>
                <span>Frontend craft</span>
                <span>Client-ready demos</span>
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
              <h2 className="type-display mt-4 text-6xl font-semibold leading-none md:text-8xl">
                Four live directions.
              </h2>
            </div>
            <p className="max-w-2xl text-xl text-chalk/68 md:justify-self-end">
              The portfolio is built to sell the studio by showing complete,
              navigable website directions. No mood-board fluff, no generic
              agency thumbnails, no same-site syndrome.
            </p>
          </MotionReveal>

          <div className="portfolio-wall mt-12">
            {featuredProjects.map((project, index) => (
              <MotionReveal key={project.slug} delay={index * 0.035}>
                <Link href={`/work/${project.slug}`} className="project-row group">
                  <div>
                    <p className="project-row-index">0{index + 1} / {project.industry}</p>
                    <p className="mt-3 text-sm text-chalk/50">{project.keyLine}</p>
                  </div>
                  <h3 className="project-row-title transition-colors group-hover:text-acid">
                    {project.name}
                  </h3>
                  <span className="project-row-chip">View case study</span>
                </Link>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-chalk text-ink">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="font-black uppercase text-flare">Studio position</p>
            <h2 className="type-display mt-4 text-6xl font-semibold leading-none md:text-8xl">
              This is not a catalogue of templates.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <div className="grid gap-6 text-xl leading-relaxed text-black/74">
              <p>
                ATHEUS exists to make independent businesses feel designed with
                intent. The work is cinematic without being vague, minimal
                without being empty, and commercial without becoming loud.
              </p>
              <p>
                Each portfolio piece is built as a complete website direction:
                brand logic, copy, layout, motion, responsive behavior, and a
                clear route to enquiry or booking.
              </p>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="kicker">Output</p>
              <h2 className="type-display mt-4 text-6xl font-semibold leading-none md:text-7xl">
                What the studio builds.
              </h2>
            </div>
            <div className="grid gap-px bg-white/12 md:grid-cols-2">
              {serviceLines.map((service) => (
                <Link
                  key={service}
                  href="/services"
                  className="group bg-ink p-5 transition-colors hover:bg-acid hover:text-ink"
                >
                  <span className="text-2xl font-black">{service}</span>
                  <span className="studio-link mt-8 text-sm">Details</span>
                </Link>
              ))}
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-graphite">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Artifacts</p>
            <h2 className="type-display mt-4 max-w-4xl text-6xl font-semibold leading-none md:text-8xl">
              Design should leave evidence.
            </h2>
          </MotionReveal>

          <MotionReveal className="artifact-strip mt-12" delay={0.08}>
            <div className="artifact-cell artifact-a">
              <span className="artifact-label">Conversion map / enquiry route / first-screen offer</span>
            </div>
            <div className="artifact-cell artifact-b">
              <span className="artifact-label">Motion rules, not decoration</span>
            </div>
            <div className="artifact-cell artifact-c">
              <span className="artifact-label">Responsive case-study systems</span>
            </div>
            <div className="artifact-cell artifact-d">
              <span className="artifact-label text-chalk/80">Typography with pressure</span>
            </div>
            <div className="artifact-cell artifact-e">
              <span className="artifact-label text-chalk/80">A portfolio that feels alive before anyone clicks contact</span>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio grid gap-8 border-y border-white/15 py-12 md:grid-cols-[1.1fr_auto] md:items-center">
          <MotionReveal>
            <p className="kicker">Lead site</p>
            <h2 className="type-display mt-4 max-w-4xl text-6xl font-semibold leading-none md:text-8xl">
              Make ATHEUS the first proof of the work.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-chalk/68">
              The site itself should do the selling: strong enough to impress a
              client, clear enough to win trust, and sharp enough to separate
              the studio from the demo brands it contains.
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

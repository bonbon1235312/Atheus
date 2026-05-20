import Link from "next/link";
import { MotionReveal } from "@/components/site/motion-reveal";
import { ProjectCard } from "@/components/site/project-card";
import { featuredProjects } from "@/lib/projects";

const services = [
  "Website design",
  "Frontend development",
  "Hospitality websites",
  "Trade and local business websites",
];

const process = [
  ["01", "Discovery", "Pin down the business, audience, offer, and the job the website has to do."],
  ["02", "Direction", "Define the visual identity, page structure, copy direction, and conversion path."],
  ["03", "Build", "Develop a fast, responsive, polished site with careful motion and a clean launch path."],
];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="hero-scene" aria-hidden="true" />
        <div className="container-studio relative grid min-h-[calc(100vh-80px)] items-end pb-16 pt-28">
          <MotionReveal className="max-w-5xl">
            <p className="kicker">atheus.dev</p>
            <h1 className="type-display mt-5 text-8xl font-semibold leading-none text-balance md:text-9xl">
              ATHEUS
            </h1>
            <p className="mt-6 max-w-2xl text-2xl font-semibold leading-tight text-chalk md:text-4xl">
              Design-led websites for independent businesses.
            </p>
            <p className="mt-6 max-w-2xl text-lg text-chalk/70">
              A small high-end web studio building portfolio websites, lead
              generation sites, and identity-rich digital homes for independent
              businesses that need to look as sharp as they work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/work" className="studio-button studio-button-primary">
                View selected work
              </Link>
              <Link href="/contact" className="studio-button studio-button-secondary">
                Start a project
              </Link>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="border-y border-white/10 bg-chalk py-4 text-ink">
        <div className="overflow-hidden">
          <div className="marquee-track">
            {[...Array(2)].map((_, group) => (
              <div key={group} className="flex min-w-max gap-10 pr-10 text-lg font-black">
                <span>IDENTITY</span>
                <span>FRONTEND</span>
                <span>MOTION</span>
                <span>CONVERSION</span>
                <span>HOSPITALITY</span>
                <span>LOCAL BUSINESS</span>
                <span>PORTFOLIO</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <MotionReveal>
              <p className="kicker">Selected work</p>
              <h2 className="type-display mt-3 max-w-3xl text-6xl font-semibold leading-none md:text-7xl">
                Four directions, four different businesses.
              </h2>
            </MotionReveal>
            <MotionReveal delay={0.08}>
              <Link href="/work" className="studio-link">
                See all case studies
              </Link>
            </MotionReveal>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <MotionReveal key={project.slug} delay={index * 0.04}>
                <ProjectCard project={project} featured={index === 0} />
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-chalk text-ink">
        <div className="container-studio grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="font-black text-flare">Studio statement</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none md:text-7xl">
              Small studio. Serious websites.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <div className="max-w-2xl text-xl leading-relaxed text-black/72">
              <p>
                ATHEUS is built to be the front door for serious independent
                businesses: a place where the work looks premium, the message is
                clear, and every page has a reason to exist.
              </p>
              <p className="mt-5">
                The portfolio shows complete website directions, not loose
                mockups. Each case study has a live demo so clients can feel the
                pace, layout, copy, and conversion path for themselves.
              </p>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <MotionReveal>
            <p className="kicker">Services</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">
              Design, build, launch.
            </h2>
            <p className="mt-5 max-w-md text-chalk/68">
              Everything needed to move from rough idea to a polished website
              that can be shown to real customers.
            </p>
          </MotionReveal>
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service, index) => (
              <MotionReveal key={service} delay={index * 0.04}>
                <div className="studio-card p-5">
                  <p className="text-sm font-black text-acid">0{index + 1}</p>
                  <h3 className="mt-4 text-2xl font-black">{service}</h3>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-graphite">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Process</p>
            <h2 className="type-display mt-3 max-w-3xl text-6xl font-semibold leading-none">
              A simple route from idea to launch.
            </h2>
          </MotionReveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {process.map(([number, title, copy], index) => (
              <MotionReveal key={title} delay={index * 0.05}>
                <div className="border-t border-white/18 pt-5">
                  <p className="font-black text-acid">{number}</p>
                  <h3 className="mt-4 text-2xl font-black">{title}</h3>
                  <p className="mt-3 text-chalk/64">{copy}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
          <MotionReveal className="mt-8">
            <Link href="/process" className="studio-link">
              Read the full process
            </Link>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio studio-card grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <MotionReveal>
            <p className="kicker">Start a project</p>
            <h2 className="type-display mt-3 max-w-3xl text-6xl font-semibold leading-none">
              Bring a business that deserves a better website.
            </h2>
            <p className="mt-5 max-w-2xl text-chalk/68">
              Send the shape of the project, the business, and what needs to
              change. You will get a clear next step, not a bloated pitch deck.
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

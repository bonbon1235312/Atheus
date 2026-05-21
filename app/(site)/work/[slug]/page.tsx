import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MotionReveal } from "@/components/site/motion-reveal";
import { getProject, projects } from "@/lib/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.name,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const heroBg = project.palette[1].value;
  const heroFg = project.palette[1].text === "dark" ? "#0a0a0a" : "#f4efe6";
  const heroAccent = project.palette[2].value;

  return (
    <main>
      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal>
            <Link href="/work" className="studio-link text-chalk/72">
              ← Back to work
            </Link>
            <p className="kicker mt-10">
              0{currentIndex + 1} <span className="text-chalk/40">/</span> {project.industry}
            </p>
            <h1 className="type-display mt-4 max-w-5xl text-6xl font-semibold leading-[0.95] sm:text-7xl md:text-9xl">
              {project.name}
            </h1>
            <p className="type-display mt-6 max-w-2xl text-2xl font-medium italic leading-tight text-chalk/82 md:text-3xl">
              {project.keyLine}
            </p>
          </MotionReveal>

          <MotionReveal className="mt-12">
            <div className="mock-browser">
              <div className="mock-browser-bar">
                <span className="mock-browser-dot" />
                <span className="mock-browser-dot" />
                <span className="mock-browser-dot" />
                <span className="ml-3 text-[11px] font-black uppercase tracking-[0.16em] text-chalk/45">
                  atheus.dev/demos/{project.slug}
                </span>
              </div>
              <div
                className="relative grid min-h-[480px] items-end p-10"
                style={{ background: heroBg, color: heroFg }}
              >
                <span
                  className="absolute left-10 top-10 h-px w-16"
                  style={{ background: heroAccent }}
                  aria-hidden="true"
                />
                <div>
                  <p
                    className="text-xs font-black uppercase tracking-[0.22em]"
                    style={{ color: heroAccent }}
                  >
                    {project.industry}
                  </p>
                  <p className="type-display mt-5 max-w-3xl text-6xl font-semibold leading-[0.95] md:text-8xl">
                    {project.keyLine}
                  </p>
                  <p
                    className="mt-6 max-w-xl text-lg"
                    style={{
                      color:
                        project.palette[1].text === "dark"
                          ? "rgba(10,10,10,0.7)"
                          : "rgba(244,239,230,0.78)",
                    }}
                  >
                    {project.concept}
                  </p>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-chalk text-ink">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <MotionReveal>
            <p className="font-black uppercase tracking-[0.2em] text-flare">Overview</p>
            <h2 className="type-display mt-3 text-5xl font-semibold leading-[1.0] md:text-7xl">
              Built around the business problem.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/48">Industry</p>
                <p className="mt-2 text-2xl font-black">{project.industry}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/48">Direction</p>
                <p className="mt-2 text-lg text-black/70">{project.style}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/48">Case focus</p>
                <ul className="mt-4 grid gap-3 text-lg text-black/74">
                  {project.focus.map((item) => (
                    <li key={item} className="flex gap-3 border-t border-black/10 pt-3">
                      <span className="text-flare">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <MotionReveal>
            <p className="kicker">Visual system</p>
            <h2 className="type-display mt-3 text-5xl font-semibold leading-[1.0] md:text-7xl">
              Type and colour <em className="italic text-acid">do the positioning.</em>
            </h2>
            <p className="mt-5 max-w-xl text-chalk/70">{project.typography}</p>
          </MotionReveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {project.palette.map((color, index) => (
              <MotionReveal key={color.name} delay={index * 0.04}>
                <div
                  className={`palette-swatch ${
                    color.text === "dark" ? "text-black" : "text-white"
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  <span>
                    <span className="block">{color.name}</span>
                    <span className="block text-[10px] opacity-70">{color.value}</span>
                  </span>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-graphite">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="kicker">Page structure</p>
            <h2 className="type-display mt-3 text-5xl font-semibold leading-[1.0] md:text-7xl">
              A layout designed to move visitors.
            </h2>
            <p className="mt-5 max-w-md text-chalk/68">
              Every section earns its place. No filler grids, no decorative testimonials, no "as seen in" badges without proof.
            </p>
          </MotionReveal>
          <div className="grid gap-0">
            {project.sections.map((section, index) => (
              <MotionReveal key={section} delay={index * 0.035}>
                <div className="flex items-baseline justify-between gap-4 border-t border-white/12 py-5">
                  <span className="font-black text-acid">0{index + 1}</span>
                  <span className="type-display flex-1 text-2xl font-semibold leading-tight md:text-3xl">
                    {section}
                  </span>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="kicker">What improved</p>
            <h2 className="type-display mt-3 text-5xl font-semibold leading-[1.0] md:text-7xl">
              Stronger design, <em className="italic text-acid">clearer business intent.</em>
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <ul className="grid gap-0">
              {project.improvements.map((item, index) => (
                <li key={item} className="grid grid-cols-[40px_1fr] gap-4 border-t border-white/12 py-5">
                  <span className="font-black text-acid">0{index + 1}</span>
                  <span className="text-lg text-chalk/82">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={project.demoHref} className="studio-button studio-button-primary">
                View live demo →
              </Link>
              <Link href="/contact" className="studio-button studio-button-secondary">
                Start a similar project
              </Link>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-pad border-t border-white/10">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Next case</p>
            <Link
              href={`/work/${nextProject.slug}`}
              className="group mt-6 flex flex-wrap items-baseline justify-between gap-6 border-y border-white/15 py-10"
            >
              <span className="type-display text-5xl font-semibold leading-[0.95] transition-colors group-hover:text-acid md:text-8xl">
                {nextProject.name}
              </span>
              <span className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-chalk/65 transition-colors group-hover:text-acid">
                {nextProject.industry} <span>→</span>
              </span>
            </Link>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}

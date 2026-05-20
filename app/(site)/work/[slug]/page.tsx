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

  return (
    <main>
      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal>
            <Link href="/work" className="studio-link text-chalk/72">
              Back to work
            </Link>
            <p className="kicker mt-10">{project.industry}</p>
            <h1 className="type-display mt-4 max-w-5xl text-7xl font-semibold leading-none md:text-9xl">
              {project.name}
            </h1>
            <p className="mt-6 max-w-2xl text-2xl font-semibold leading-tight text-chalk/82">
              {project.keyLine}
            </p>
          </MotionReveal>

          <MotionReveal className="mt-10">
            <div className="mock-browser">
              <div className="mock-browser-bar">
                <span className="mock-browser-dot" />
                <span className="mock-browser-dot" />
                <span className="mock-browser-dot" />
              </div>
              <div
                className="grid min-h-[460px] items-end p-8"
                style={{
                  background: `linear-gradient(135deg, ${project.palette[0].value}, ${project.palette[1].value} 56%, ${project.palette[2].value})`,
                }}
              >
                <div>
                  <p
                    className={`text-lg font-black ${
                      project.palette[1].text === "dark" ? "text-black/72" : "text-white/74"
                    }`}
                  >
                    {project.concept}
                  </p>
                  <p
                    className={`type-display mt-5 max-w-3xl text-7xl font-semibold leading-none ${
                      project.palette[1].text === "dark" ? "text-black" : "text-white"
                    }`}
                  >
                    {project.keyLine}
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
            <p className="font-black text-flare">Overview</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">
              Built around the business problem.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-sm font-black text-black/48">Industry</p>
                <p className="mt-2 text-2xl font-black">{project.industry}</p>
              </div>
              <div>
                <p className="text-sm font-black text-black/48">Design direction</p>
                <p className="mt-2 text-lg text-black/70">{project.style}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-black text-black/48">Case study focus</p>
                <ul className="mt-3 grid gap-2 text-lg text-black/72">
                  {project.focus.map((item) => (
                    <li key={item}>- {item}</li>
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
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">
              Typography and colour do the positioning work.
            </h2>
            <p className="mt-5 max-w-xl text-chalk/68">{project.typography}</p>
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
                  {color.name} / {color.value}
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-graphite">
        <div className="container-studio grid gap-10 lg:grid-cols-2">
          <MotionReveal>
            <p className="kicker">Key sections</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">
              A page structure designed to move visitors.
            </h2>
          </MotionReveal>
          <div className="grid gap-3">
            {project.sections.map((section, index) => (
              <MotionReveal key={section} delay={index * 0.035}>
                <div className="flex items-center justify-between border-t border-white/12 py-4">
                  <span className="font-black text-acid">0{index + 1}</span>
                  <span className="text-xl font-semibold">{section}</span>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio grid gap-10 lg:grid-cols-[1fr_1fr]">
          <MotionReveal>
            <p className="kicker">Responsive preview</p>
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.42fr]">
              <div className="mock-browser min-h-[360px]">
                <div className="mock-browser-bar">
                  <span className="mock-browser-dot" />
                  <span className="mock-browser-dot" />
                  <span className="mock-browser-dot" />
                </div>
                <div className="grid min-h-[324px] content-between p-5" style={{ background: project.palette[1].value }}>
                  <div className="h-3 w-28" style={{ background: project.palette[2].value }} />
                  <div>
                    <div className="h-12 w-4/5 bg-white/24" />
                    <div className="mt-3 h-12 w-3/5 bg-white/18" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <span className="h-20 bg-white/12" />
                    <span className="h-20 bg-white/12" />
                    <span className="h-20 bg-white/12" />
                  </div>
                </div>
              </div>
              <div className="mock-browser min-h-[360px]">
                <div className="mock-browser-bar">
                  <span className="mock-browser-dot" />
                  <span className="mock-browser-dot" />
                  <span className="mock-browser-dot" />
                </div>
                <div className="grid min-h-[324px] content-between p-4" style={{ background: project.palette[0].value }}>
                  <div className="h-3 w-20" style={{ background: project.palette[2].value }} />
                  <div className="grid gap-2">
                    <span className="h-9 bg-black/20" />
                    <span className="h-9 bg-black/16" />
                    <span className="h-9 bg-black/12" />
                  </div>
                  <span className="h-12" style={{ background: project.palette[2].value }} />
                </div>
              </div>
            </div>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <p className="kicker">What improved</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">
              Stronger design, clearer business intent.
            </h2>
            <ul className="mt-7 grid gap-4 text-lg text-chalk/72">
              {project.improvements.map((item) => (
                <li key={item} className="border-t border-white/12 pt-4">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={project.demoHref} className="studio-button studio-button-primary">
                View live demo
              </Link>
              <Link href="/contact" className="studio-button studio-button-secondary">
                Start a similar project
              </Link>
            </div>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}

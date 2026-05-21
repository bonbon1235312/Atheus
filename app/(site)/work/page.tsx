import type { Metadata } from "next";
import { MotionReveal } from "@/components/site/motion-reveal";
import { ProjectCard } from "@/components/site/project-card";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Selected Work",
  description: "Selected ATHEUS case studies for independent business websites.",
};

export default function WorkPage() {
  return (
    <main>
      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Work</p>
            <h1 className="type-display mt-4 max-w-4xl text-6xl font-semibold leading-[0.95] sm:text-7xl md:text-8xl">
              Four case studies. <em className="italic text-acid">Four independent businesses.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-chalk/70">
              Each piece is a complete website direction — identity, copy, layout, motion and conversion route — built so a client can read it as their own.
            </p>
          </MotionReveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {projects.map((project, index) => (
              <MotionReveal key={project.slug} className="min-w-0" delay={index * 0.04}>
                <ProjectCard project={project} featured={index === 0} />
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

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
            <h1 className="type-display mt-4 max-w-4xl text-6xl font-semibold leading-none sm:text-7xl md:text-8xl">
              Case studies for independent businesses with actual texture.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-chalk/68">
              Each case study pairs a commercial problem with a complete live
              demo site, showing how ATHEUS shapes identity, copy, layout, and
              conversion into something a client can actually use.
            </p>
          </MotionReveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {projects.map((project, index) => (
              <MotionReveal key={project.slug} delay={index * 0.04}>
                <ProjectCard project={project} featured={index === 0} />
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

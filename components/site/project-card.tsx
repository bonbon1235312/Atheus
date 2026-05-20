import Link from "next/link";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className={`group studio-card block w-full min-w-0 overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${featured ? "md:col-span-2" : ""}`}
    >
      <div
        className="min-h-72 border-b border-white/10 p-5"
        style={{
          background: `linear-gradient(135deg, ${project.palette[0].value}, ${project.palette[1].value} 48%, ${project.palette[2].value})`,
        }}
      >
        <div className="flex h-full min-h-60 flex-col justify-between">
          <p
            className={`text-sm font-black ${
              project.palette[0].text === "dark" ? "text-black/72" : "text-white/78"
            }`}
          >
            {project.industry}
          </p>
          <div>
            <p
              className={`type-display text-6xl font-semibold leading-none md:text-7xl ${
                project.palette[1].text === "dark" ? "text-black" : "text-white"
              }`}
            >
              {project.name}
            </p>
            <p
              className={`mt-3 max-w-sm text-lg font-semibold ${
                project.palette[1].text === "dark" ? "text-black/68" : "text-white/76"
              }`}
            >
              {project.keyLine}
            </p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-chalk/72">{project.summary}</p>
        <span className="studio-link mt-6 text-chalk">View case study</span>
      </div>
    </Link>
  );
}

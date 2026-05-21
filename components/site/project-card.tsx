import Link from "next/link";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const bg = project.palette[1].value;
  const fg = project.palette[1].text === "dark" ? "#0a0a0a" : "#f4efe6";
  const accent = project.palette[2].value;
  const fgMuted =
    project.palette[1].text === "dark" ? "rgba(10,10,10,0.62)" : "rgba(244,239,230,0.72)";

  return (
    <Link
      href={`/work/${project.slug}`}
      className={`group studio-card block w-full min-w-0 overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div
        className="relative min-h-72 border-b border-white/10 p-7"
        style={{ background: bg, color: fg }}
      >
        <span
          className="absolute left-7 top-7 h-px w-12"
          style={{ background: accent }}
          aria-hidden="true"
        />

        <div className="flex h-full min-h-60 flex-col justify-between pt-6">
          <p
            className="text-xs font-black uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {project.industry}
          </p>

          <div>
            <p
              className="type-display text-6xl font-semibold leading-[0.92] tracking-tight md:text-7xl"
            >
              {project.name}
            </p>
            <p
              className="type-display mt-4 max-w-md text-2xl font-medium italic leading-snug md:text-3xl"
              style={{ color: fgMuted }}
            >
              {project.keyLine}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 p-5">
        <p className="max-w-xl text-chalk/70">{project.summary}</p>
        <span className="studio-link shrink-0 text-chalk">View case</span>
      </div>
    </Link>
  );
}

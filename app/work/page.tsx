import Image from "next/image";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { StructuredData } from "@/components/marketing/structured-data";
import { breadcrumbSchema, marketingMetadata } from "@/lib/seo";
import { selectedWork } from "@/lib/work";

export const metadata = marketingMetadata({
  title: "Selected Work | Websites & Software by Atheus",
  description: "Explore KickOff, a live digital platform by Atheus, alongside bespoke website concepts for hospitality, construction and electrical trades.",
  path: "/work",
  image: "/work/kickoff-desktop.webp",
});

export default function WorkPage() {
  return (
    <MarketingShell variant="agency">
      <StructuredData data={breadcrumbSchema([{ name: "Atheus", path: "/" }, { name: "Work", path: "/work" }])} />
      <section className="agency-subhero">
        <div className="ax-container">
          <div className="agency-section-label"><span>Selected work / 2026</span><span>Websites & software</span></div>
          <div className="agency-subhero-grid"><h1>Different worlds.<br /><em>Built with intent.</em></h1><p>A live platform and three explorations in visual direction. Each project starts with a different audience, a different problem, and a reason to exist.</p></div>
        </div>
      </section>
      <section className="agency-work agency-work--index" aria-label="Selected projects">
        <div className="ax-container">
          {selectedWork.map((project, index) => (
            <article className="agency-case" key={project.slug}>
              <div className="agency-case-top"><span>0{index + 1} / 04</span><span>{project.category} / {project.status}</span></div>
              <Link className={`agency-case-image${index === 0 ? " studio-live-image" : ""}`} href={project.href} aria-label={`Read the ${project.name} case study`}>
                <Image src={project.image} alt={`${project.name} ${index === 0 ? "live platform" : "website concept"}`} width={project.width} height={project.height} sizes="(max-width: 760px) 100vw, 85vw" preload={index === 0} />
                <span aria-hidden="true">↗</span>
              </Link>
              <div className="agency-case-bottom"><h2>{project.name}</h2><div><p>{project.summary}</p><Link className="agency-arrow-link" href={project.href}>Inside the project <span aria-hidden="true">↗</span></Link></div></div>
            </article>
          ))}
        </div>
      </section>
      <section className="agency-offer"><div className="ax-container agency-offer-grid"><div><div className="agency-section-label"><span>Your project / Next</span></div><h2>Something worth<br /><em>making real.</em></h2></div><div className="agency-offer-aside"><p>From a business website to a product with moving parts, start with the challenge.</p><Link className="agency-btn" href="/contact">Start a project ↗</Link></div></div></section>
    </MarketingShell>
  );
}


import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { WowCta } from "@/components/marketing/process-rail";
import { Reveal } from "@/components/marketing/reveal";
import { DEMO_SITES } from "@/lib/demo-sites";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Three full demo sites built to show range — a cafe, an architecture studio, and a design agency. Open them and judge the craft.",
  // Matches the per-demo pages, which are already noindex: these are
  // illustrative builds, not real clients competing in search.
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemosPage() {
  return (
    <MarketingShell>
      <section className="ax-section">
        <div className="ax-container">
          <Reveal className="ax-section-head">
            <p className="ax-kicker-pill">Demo sites</p>
            <h1 className="ax-h1">Three brands. One standard.</h1>
            <p className="ax-lead">
              Each demo is a complete site, not a screenshot. Different industry,
              different voice, same engineering bar — open them and judge the craft
              directly.
            </p>
          </Reveal>

          <div className="ax-demo-index">
            {DEMO_SITES.map((site, index) => (
              <Reveal key={site.slug} delayMs={index * 70}>
                <article className="ax-demo-row">
                  <Link
                    className="ax-demo-row-media"
                    href={`/demos/${site.slug}`}
                    aria-label={`Open the ${site.name} demo site`}
                  >
                    <div className="ax-bezel">
                      <div className="ax-bezel-inner">
                        <Image
                          src={site.image}
                          alt=""
                          width={1400}
                          height={900}
                          sizes="(max-width: 900px) 100vw, 52vw"
                        />
                      </div>
                    </div>
                  </Link>

                  <div className="ax-demo-row-copy">
                    <span
                      className="ax-demo-row-category"
                      style={{ color: site.accent }}
                    >
                      {site.category}
                    </span>
                    <h2 className="ax-h2">{site.name}</h2>
                    <p className="ax-demo-row-tagline">{site.tagline}</p>
                    <p className="ax-lead">{site.description}</p>
                    <Link
                      className="ax-btn ax-btn-secondary"
                      href={`/demos/${site.slug}`}
                    >
                      Open {site.name}
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WowCta
        title="Want one of these for your business?"
        lead="Send a short brief: business name, what you sell, and any links you already have. We will come back with a clear next step."
        primary={{ href: "/contact", label: "Request a quote" }}
        secondary={{ href: "/products/sites", label: "See Sites pricing" }}
      />
    </MarketingShell>
  );
}

import type { Metadata } from "next";

import { AboutHero } from "@/components/marketing/about-hero";
import { BeliefStack } from "@/components/marketing/belief-stack";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SpotlightCard } from "@/components/marketing/motion-primitives";
import { WowCta } from "@/components/marketing/process-rail";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Atheus is a technology company building premium SaaS products, automation platforms, and developer tools.",
};

const principles = [
  {
    title: "Parent company, focused products",
    body: "Atheus is not a single app. It is the company behind a suite of operational tools that share the same engineering bar.",
  },
  {
    title: "Automation with judgment",
    body: "We automate collection, scheduling, and access checks. People keep the decisions that need context.",
  },
  {
    title: "Operator-first interfaces",
    body: "Admin software should stay calm under weekly pressure. Clarity beats feature count.",
  },
  {
    title: "Serious architecture",
    body: "Tenancy, credentials, failure modes, and data ownership are product decisions, not afterthoughts.",
  },
] as const;

export default function AboutPage() {
  return (
    <MarketingShell>
      <AboutHero />

      <BeliefStack
        lines={[
          "Software should feel inevitable.",
          "Automation belongs where judgment does not.",
          "Operators deserve calm interfaces.",
          "Craft is a product decision.",
        ]}
      />

      <section className="ax-section" style={{ paddingTop: 0 }}>
        <div className="ax-container ax-about-stack">
          <Reveal as="article" className="ax-about-block">
            <h2 className="ax-h2">What we build</h2>
            <p className="ax-body">
              We design and ship SaaS products, automation platforms, developer tools,
              and fully custom websites. The common thread is removing repetitive work
              and shipping interfaces that feel intentional.
            </p>
          </Reveal>

          <Reveal as="article" className="ax-about-block">
            <h2 className="ax-h2">How we work</h2>
            <p className="ax-body">
              Small surface area. Strong defaults. Explicit trade-offs. We prefer
              systems that operators can understand in one sitting over platforms that
              require a training programme.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="ax-section">
        <div className="ax-container">
          <Reveal className="ax-section-head">
            <h2 className="ax-h2">Principles</h2>
          </Reveal>
          <div className="ax-feature-grid">
            {principles.map((item, index) => (
              <Reveal key={item.title} delayMs={index * 50} as="article">
                <SpotlightCard>
                  <div className="ax-feature">
                    <h3 className="ax-h3">{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WowCta
        title="Work with us"
        lead="Product access, collaboration, or a custom website. Start with a short brief."
        primary={{ href: "/contact", label: "Contact" }}
        secondary={{ href: "/products", label: "View products" }}
      />
    </MarketingShell>
  );
}

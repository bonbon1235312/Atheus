import type { Metadata } from "next";

import { CascadeList } from "@/components/marketing/cascade-list";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PricingMotion } from "@/components/marketing/pricing-motion";
import { WowCta } from "@/components/marketing/process-rail";
import { Reveal } from "@/components/marketing/reveal";
import { ScrollShowcase } from "@/components/marketing/scroll-showcase";
import { SitesHero } from "@/components/marketing/sites-hero";
import { StepMorph } from "@/components/marketing/step-morph";
import { VelocityMarquee } from "@/components/marketing/velocity-marquee";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Sites",
  description:
    "Fully custom websites from £600. Designed and built for small businesses that need to look serious online.",
  openGraph: {
    title: "Sites | Atheus",
    description:
      "Custom websites from £600. No templates. Design and engineering in one team.",
    images: [{ url: "/brand/sites-hearth.jpg" }],
  },
};

const process = [
  {
    title: "Brief",
    body: "Tell us who you are, who you serve, and what the site needs to do. We reply with a clear scope and quote.",
  },
  {
    title: "Design",
    body: "A custom visual system for your brand. Layout, type, colour, and motion planned before a single template gets near it.",
  },
  {
    title: "Build",
    body: "Production-grade frontend: fast, responsive, accessible, and ready to host. You review on a live preview.",
  },
  {
    title: "Launch",
    body: "We ship, connect the domain if needed, and leave you with a site that looks intentional on day one.",
  },
] as const;

const includes = [
  "Custom design, not a skin on a template",
  "Mobile-first responsive layout",
  "Performance and accessibility built in",
  "Contact paths that actually convert",
  "Subtle motion that feels premium",
  "Launch support and clean handoff",
];

const marquee = [
  "Custom design",
  "From £600",
  "Fast delivery",
  "No templates",
  "Mobile ready",
  "Launch support",
];

export default function SitesPage() {
  const product = getProduct("sites")!;

  return (
    <MarketingShell>
      <SitesHero />
      <VelocityMarquee items={marquee} />
      <ScrollShowcase />
      <StepMorph
        kicker="How it works"
        title="Four moves. No theatre."
        lead="A short path from first message to live site."
        steps={[...process]}
      />
      <CascadeList
        title="What you get"
        lead="Everything needed to look credible online, without enterprise agency rates."
        items={includes}
      />
      <div id="pricing">
        <PricingMotion
          note={product.pricingNote}
          tiers={product.pricingTiers}
          cta={{ href: "/contact", label: "Request a quote" }}
        />
      </div>
      <section className="ax-section" style={{ paddingTop: 0 }}>
        <div className="ax-container">
          <Reveal className="ax-section-head">
            <h2 className="ax-h2">FAQ</h2>
          </Reveal>
          <div className="ax-faq-list">
            {product.faqs.map((faq) => (
              <details className="ax-faq" key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <WowCta
        title="Ready for a site that looks the part?"
        lead="Send a short brief: business name, what you sell, and any links you already have. We will come back with a clear next step."
        primary={{ href: "/contact", label: "Request a quote" }}
        secondary={{ href: "/products", label: "All products" }}
      />
    </MarketingShell>
  );
}

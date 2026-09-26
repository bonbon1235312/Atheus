import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ProjectBrief } from "@/components/marketing/project-brief";
import { marketingMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = marketingMetadata({
  title: "Start a Project | Contact Atheus",
  description: "Tell Evan at Atheus about your website, redesign or custom software project. Prepare a short brief or email hello@atheus.dev directly.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <MarketingShell variant="agency">
      <section className="agency-subhero">
        <div className="ax-container">
          <div className="agency-section-label"><span>Contact / Atheus</span><span>One conversation starts it</span></div>
          <div className="agency-subhero-grid">
            <h1>Tell me what<br /><em>you’re building.</em></h1>
            <p>You don’t need a finished brief. A few details about the idea, the people it serves and what you need are enough to start.</p>
          </div>
        </div>
      </section>
      <section className="studio-contact-grid ax-container"><aside><span className="studio-eyebrow">What happens next?</span><h2>Read personally.<br />Considered properly.</h2><p>I’ll read your email and reply with any questions. If the project looks like a good fit, we’ll agree the scope, timeline and price before any work begins.</p><span className="studio-eyebrow">Prefer to write directly?</span><a className="studio-contact-email" href="mailto:hello@atheus.dev">hello@atheus.dev ↗</a></aside><ProjectBrief directDelivery={Boolean(process.env.RESEND_API_KEY)} /></section>
    </MarketingShell>
  );
}

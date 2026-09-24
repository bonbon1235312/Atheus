import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { marketingMetadata } from "@/lib/seo";

export const metadata = marketingMetadata({
  title: "Atheus League Premium | Unlimited Leagues",
  description: "Upgrade Atheus League for unlimited leagues and priority support. Premium is £8 per month.",
  path: "/upgrade",
});

export default function UpgradePage() {
  return (
    <MarketingShell variant="agency">
      <section className="agency-subhero">
        <div className="ax-container">
          <div className="agency-section-label"><span>League / Premium</span><span>More room to run</span></div>
          <div className="agency-subhero-grid">
            <h1>One platform.<br /><em>More leagues.</em></h1>
            <p>The free tier includes one active league with the full core feature set. Premium removes that limit and adds priority support.</p>
          </div>
        </div>
      </section>
      <section className="agency-pricing agency-upgrade">
        <div className="ax-container">
          <div className="agency-section-label"><span>Premium / Early access</span><span>£8 per month</span></div>
          <div className="agency-pricing-intro"><h2>Unlimited<br /><em>possibility.</em></h2><p>Billing is handled manually during early access. Message us on Discord to arrange Premium access.</p></div>
          <div className="agency-pricing-list">
            {["Everything in the free tier", "Unlimited active leagues", "One account across every league", "Priority platform support"].map((item, index) => (
              <div className="agency-upgrade-row" key={item}><span>0{index + 1}</span><p>{item}</p><span aria-hidden="true">↗</span></div>
            ))}
          </div>
          <div className="agency-upgrade-actions">
            <a className="agency-btn" href="https://discord.gg/dPrMMc82bf" rel="noreferrer" target="_blank">Contact on Discord <span aria-hidden="true">↗</span></a>
            <Link className="agency-arrow-link" href="/admin">Back to dashboard <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Upgrade to Premium",
  description:
    "Unlock unlimited leagues and priority support on Atheus League for £8 per month.",
};

export default function UpgradePage() {
  return (
    <MarketingShell>
      <section className="ax-page-hero">
        <div className="ax-container ax-product-hero-grid">
          <Reveal>
            <span className="ax-badge" data-tone="live">
              League Premium
            </span>
            <h1 className="ax-h1" style={{ marginTop: "1rem" }}>
              Run more than one league.
            </h1>
            <p className="ax-lead">
              The free tier includes one active league with the full feature set.
              Premium removes that limit and adds priority support for £8 per month.
            </p>
            <p className="ax-body" style={{ marginTop: "1rem" }}>
              Billing is handled manually during early access. Message us on Discord
              to activate Premium. Upgrades are applied the same day.
            </p>
          </Reveal>

          <Reveal delayMs={70}>
            <article className="ax-price-card" data-featured="true">
              <h2 className="ax-h3">Premium</h2>
              <p className="ax-price">£8 / month</p>
              <p>Unlimited leagues and priority platform support.</p>
              <ul className="ax-upgrade-list">
                <li>Everything in the free tier</li>
                <li>Unlimited active leagues</li>
                <li>One account across every league</li>
                <li>Priority platform support</li>
              </ul>
              <div className="ax-cta-actions" style={{ marginTop: "1.25rem" }}>
                <a
                  className="ax-btn ax-btn-primary"
                  href="https://discord.gg/dPrMMc82bf"
                  rel="noreferrer"
                  target="_blank"
                >
                  Contact on Discord
                </a>
                <Link className="ax-btn ax-btn-secondary" href="/admin">
                  Back to dashboard
                </Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}

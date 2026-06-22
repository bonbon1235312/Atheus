import Link from "next/link";

export const metadata = {
  title: "Upgrade to Premium — Atheus",
};

export default function UpgradePage() {
  return (
    <main className="site-access-page">
      <div className="landing-ambient" aria-hidden="true" />
      <header>
        <Link className="landing-brand" href="/" aria-label="Atheus home">
          <span>A</span>
          <strong>atheus</strong>
        </Link>
        <Link href="/admin">Dashboard</Link>
      </header>

      <section className="site-access-grid">
        <div>
          <p className="landing-status">
            <i />
            Premium plan
          </p>
          <h1>Run more than one league.</h1>
          <p>
            The free tier gives you one active league with the full feature set.
            Premium removes that limit and adds priority support for £8 per
            month.
          </p>
          <p>
            Billing is handled manually during early access. Reach out via
            Discord to activate Premium for your account. Upgrades are applied
            the same day.
          </p>
        </div>

        <div className="site-access-panel">
          <div>
            <span>Premium / £8 per month</span>
            <small>Unlimited leagues · priority support</small>
          </div>

          <ul className="pricing-feature-list">
            <li>Everything in the free tier</li>
            <li>Unlimited active leagues</li>
            <li>One account across every league</li>
            <li>Priority platform support</li>
          </ul>

          <a
            className="button button-primary"
            href="https://discord.gg/dPrMMc82bf"
            rel="noreferrer"
            target="_blank"
          >
            Contact us on Discord
          </a>

          <Link className="site-login-link" href="/admin">
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

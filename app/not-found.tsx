import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function NotFound() {
  return (
    <MarketingShell>
      <section className="ax-page-hero">
        <div className="ax-container">
          <p className="ax-eyebrow">404</p>
          <h1 className="ax-h1">Page not found</h1>
          <p className="ax-lead">
            That route does not exist. Head home or browse the product suite.
          </p>
          <div className="ax-hero-actions">
            <Link className="ax-btn ax-btn-primary" href="/">
              Home
            </Link>
            <Link className="ax-btn ax-btn-secondary" href="/products">
              Products
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function NotFound() {
  return (
    <MarketingShell variant="agency">
      <section className="agency-contact agency-not-found">
        <div className="ax-container">
          <div className="agency-section-label"><span>404 / Lost your way?</span></div>
          <div className="agency-contact-intro">
            <h1>Nothing here.<br /><em>Plenty elsewhere.</em></h1>
            <p>That address does not lead to a page. Find your way back into the studio.</p>
          </div>
          <div className="agency-not-found-links">
            <Link className="agency-btn" href="/">Back to home <span aria-hidden="true">↗</span></Link>
            <Link className="agency-arrow-link" href="/work">Explore the work <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

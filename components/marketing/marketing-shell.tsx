import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SkipLink } from "./skip-link";

export function MarketingShell({ children, variant }: { children: ReactNode; variant?: "agency" }) {
  return (
    <div className={variant === "agency" ? "ax-page ax-page--agency" : "ax-page"}>
      <SkipLink />
      <div className="ax-atmosphere" aria-hidden="true">
        <div className="ax-atmosphere-glow ax-atmosphere-glow-a" />
        <div className="ax-atmosphere-glow ax-atmosphere-glow-b" />
        <div className="ax-atmosphere-veil" />
        <div className="ax-atmosphere-grid" />
        <div className="ax-atmosphere-vignette" />
      </div>
      <div className="ax-noise" aria-hidden="true" />
      <div className="ax-shell">
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SkipLink } from "./skip-link";
import { ScrollProgress } from "./scroll-progress";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="ax-page">
      <SkipLink />
      <ScrollProgress />
      <div className="ax-atmosphere" aria-hidden="true">
        <div className="ax-atmosphere-glow ax-atmosphere-glow-a" />
        <div className="ax-atmosphere-glow ax-atmosphere-glow-b" />
        <div className="ax-atmosphere-glow ax-atmosphere-glow-c" />
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

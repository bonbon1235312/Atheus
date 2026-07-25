import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  MotionProductCard,
  ProductsHero,
} from "@/components/marketing/motion-product-card";
import { Reveal } from "@/components/marketing/reveal";
import { WowCta } from "@/components/marketing/process-rail";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore Atheus products: Sites from £600, League, Club, and BlackWall.",
};

export default function ProductsPage() {
  const ordered = [
    ...products.filter((p) => p.slug === "sites"),
    ...products.filter((p) => p.slug !== "sites"),
  ];

  return (
    <MarketingShell>
      <ProductsHero />

      <section className="ax-section" style={{ paddingTop: 0 }}>
        <div className="ax-container">
          <div
            className="ax-product-grid"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
          >
            {ordered.map((product, index) => (
              <Reveal key={product.slug} delayMs={index * 60}>
                <MotionProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WowCta
        title="Not sure where to start?"
        lead="Most people begin with Sites. If you need operations software, we will point you to the right product."
        primary={{ href: "/products/sites", label: "Get a site" }}
        secondary={{ href: "/contact", label: "Talk to us" }}
      />
    </MarketingShell>
  );
}

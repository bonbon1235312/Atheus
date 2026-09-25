import Image from "next/image";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { StructuredData } from "@/components/marketing/structured-data";
import { products, statusLabel } from "@/lib/products";
import { breadcrumbSchema, marketingMetadata } from "@/lib/seo";

export const metadata = marketingMetadata({
  title: "Websites & Digital Products | Atheus",
  description: "Explore custom websites and digital products by Atheus, from expressive business sites to software for leagues, clubs and access control.",
  path: "/products",
});

export default function ProductsPage() {
  const ordered = [products.find((product) => product.slug === "sites")!, ...products.filter((product) => product.slug !== "sites")];
  return (
    <MarketingShell variant="agency">
      <StructuredData data={breadcrumbSchema([
        { name: "Atheus", path: "/" },
        { name: "Products", path: "/products" },
      ])} />
      <section className="agency-subhero">
        <div className="ax-container">
          <div className="agency-section-label"><span>Products / Atheus</span><span>Digital experiences and tools</span></div>
          <div className="agency-subhero-grid">
            <h1>Design what’s seen.<br /><em>Build what works.</em></h1>
            <p>Atheus makes websites with personality and software for the people doing the work behind the scenes.</p>
          </div>
        </div>
      </section>
      <section className="agency-product-index">
        <div className="ax-container">
          {ordered.map((product, index) => (
            <article className="agency-product-row" key={product.slug}>
              <div className="agency-product-row-top"><span>0{index + 1} / 04</span><span>{product.category} / {statusLabel[product.status]}</span></div>
              <div className="agency-product-row-main">
                <div className="agency-product-row-copy">
                  <h2>{product.name}</h2>
                  <p>{product.tagline}</p>
                  <span>{product.description}</span>
                  <Link className="agency-arrow-link" href={`/products/${product.slug}`}>Explore {product.name} <span aria-hidden="true">↗</span></Link>
                </div>
                <Link className="agency-product-row-image" href={`/products/${product.slug}`} aria-label={`Explore ${product.name}`}>
                  <Image src={product.image} alt={product.imageAlt} width={1200} height={760} sizes="(max-width: 760px) 100vw, 45vw" priority={index === 0} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="agency-offer">
        <div className="ax-container agency-offer-grid">
          <div><div className="agency-section-label"><span>Explore the fit</span></div><h2>Tell us what you want to make better.</h2></div>
          <div className="agency-offer-aside"><p>From a new public face to a better operational workflow, start with the challenge.</p><Link className="agency-btn" href="/contact">Start a project <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </MarketingShell>
  );
}

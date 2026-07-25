import Link from "next/link";
import type { CSSProperties } from "react";

import { statusLabel, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      className="ax-product-card"
      href={`/products/${product.slug}`}
      aria-label={`${product.name}: ${product.tagline}`}
      style={{ "--ax-product-accent": product.accent } as CSSProperties}
    >
      <div className="ax-product-card-media" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt="" loading="lazy" decoding="async" />
      </div>

      <div className="ax-product-card-top">
        <div>
          <span className="ax-product-logo">{product.mark}</span>
          <h3 className="ax-h3">{product.name}</h3>
        </div>
        <span className="ax-badge" data-tone={product.status}>
          {statusLabel[product.status]}
        </span>
      </div>

      <p>{product.tagline}</p>

      <div className="ax-product-card-footer">
        <span className="ax-product-category">{product.category}</span>
        <span className="ax-text-link">
          Learn more
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

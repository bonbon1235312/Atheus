import Link from "next/link";

import { products } from "@/lib/products";

export function SiteFooter() {
  return (
    <footer className="ax-footer">
      <div className="ax-container">
        <div className="ax-footer-grid">
          <div className="ax-footer-brand">
            <Link className="ax-brand" href="/" aria-label="Atheus home">
              <span className="ax-brand-mark" aria-hidden="true">
                A
              </span>
              Atheus
            </Link>
            <p>
              Custom websites from £600, plus SaaS products built with serious craft.
            </p>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/products">Products</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Products</h4>
            <ul>
              {products.map((product) => (
                <li key={product.slug}>
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Access</h4>
            <ul>
              <li>
                <Link href="/admin">Platform sign in</Link>
              </li>
              <li>
                <Link href="/upgrade">League premium</Link>
              </li>
              <li>
                <a href="mailto:hello@atheus.dev">Email</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="ax-footer-bottom">
          <span>© {new Date().getFullYear()} Atheus</span>
          <span>Built for speed, reliability, and clear UX</span>
        </div>
      </div>
    </footer>
  );
}

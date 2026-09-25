import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="ax-footer">
      <div className="ax-container">
        <div className="agency-footer-main">
          <div>
            <p className="agency-footer-eyebrow">Atheus / Independent digital studio</p>
            <h2>Let’s make<br /><em>something matter.</em></h2>
          </div>
          <a className="agency-footer-email" href="mailto:hello@atheus.dev">hello@atheus.dev <span aria-hidden="true">↗</span></a>
        </div>
        <div className="agency-footer-nav">
          <Link className="agency-footer-wordmark" href="/" aria-label="Atheus home">Atheus<span>.</span></Link>
          <nav aria-label="Footer">
            <Link href="/demos">Work</Link>
            <Link href="/products/sites">Websites</Link>
            <Link href="/products">Products</Link>
            <Link href="/about">Studio</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
        <div className="ax-footer-bottom">
          <span>© {new Date().getFullYear()} Atheus</span>
          <span>Design with intent. Built to last.</span>
        </div>
      </div>
    </footer>
  );
}

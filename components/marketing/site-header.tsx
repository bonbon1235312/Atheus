"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const links = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/studio", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="ax-header" data-scrolled={scrolled ? "true" : "false"}>
      <div className="ax-header-bar">
        <Link className="ax-brand" href="/" aria-label="Atheus home">
          <span className="ax-brand-mark" aria-hidden="true">A<span>.</span></span>
          <span>ATHEUS.</span>
        </Link>

        <nav className="ax-nav" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ax-header-actions">
          <Link className="ax-btn ax-btn-primary" href="/contact">
            Start a project <span aria-hidden="true">↗</span>
          </Link>
          <button
            type="button"
            className="ax-menu-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="ax-menu-lines" data-open={open ? "true" : "false"} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div
        id={panelId}
        className="ax-mobile-panel"
        data-open={open ? "true" : "false"}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link className="ax-btn ax-btn-primary" href="/contact" onClick={() => setOpen(false)}>
          Start a project <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}

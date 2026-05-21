"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.classList.add("nav-open");
    } else {
      document.body.classList.remove("nav-open");
    }
    return () => {
      document.body.classList.remove("nav-open");
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="studio-header sticky top-0 z-50 border-b border-white/10">
        <div className="container-studio flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="brand-lockup" aria-label="ATHEUS home">
            <span className="brand-mark">A</span>
            <span className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tight">ATHEUS</span>
              <span className="mt-1 hidden text-[11px] font-black uppercase text-acid sm:block">
                Studio
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 border border-white/12 p-1 text-xs font-black uppercase text-chalk/72 md:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 transition-colors ${
                    active ? "bg-chalk text-ink" : "hover:bg-chalk hover:text-ink"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="studio-button studio-button-primary hidden md:inline-flex">
              Start a project
            </Link>
            <button
              type="button"
              className="md:hidden -m-2 p-2 text-chalk"
              aria-controls="mobile-drawer"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-drawer"
        className="mobile-drawer md:hidden"
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
      >
        <div className="container-studio flex min-h-20 items-center justify-between gap-4 border-b border-white/10">
          <span className="brand-lockup">
            <span className="brand-mark">A</span>
            <span className="text-xl font-black tracking-tight">ATHEUS</span>
          </span>
          <button
            type="button"
            className="-m-2 p-2 text-chalk"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav className="container-studio flex flex-col pb-12 pt-4" aria-label="Mobile navigation">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="type-display flex items-baseline justify-between border-b border-white/10 py-5 text-5xl font-semibold leading-none transition-colors hover:text-acid"
              onClick={() => setOpen(false)}
            >
              <span>{item.label}</span>
              <span className="text-xs font-black tracking-[0.2em] text-acid">0{index + 1}</span>
            </Link>
          ))}
          <div className="mt-10 grid gap-3">
            <Link
              href="/contact"
              className="studio-button studio-button-primary justify-center"
              onClick={() => setOpen(false)}
            >
              Start a project
            </Link>
            <a
              href="mailto:hello@atheus.dev"
              className="studio-button studio-button-secondary justify-center"
              onClick={() => setOpen(false)}
            >
              hello@atheus.dev
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}

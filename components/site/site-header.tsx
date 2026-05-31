"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DISCORD_SERVER_URL, INVITE_URL, NAV_LINKS } from "@/lib/site";
import { AtheusMark } from "@/components/site/atheus-mark";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="studio-header sticky top-0 z-50 border-b border-white/10">
        <div className="container-studio flex min-h-[72px] items-center justify-between gap-4">
          <Link href="/" className="brand-lockup" aria-label="atheus home">
            <AtheusMark size={34} />
            <span className="text-lg font-black lowercase tracking-tight">atheus</span>
          </Link>

          <nav
            className="hidden items-center gap-8 text-sm text-chalk/64 md:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-chalk"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={DISCORD_SERVER_URL}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-chalk"
            >
              Support
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="studio-button studio-button-primary hidden md:inline-flex"
            >
              Add to Discord
            </a>
            <button
              type="button"
              className="-m-2 p-2 text-chalk md:hidden"
              aria-controls="mobile-drawer"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-drawer" className="mobile-drawer md:hidden" aria-hidden={!open} role="dialog" aria-modal="true">
        <div className="container-studio flex min-h-[72px] items-center justify-between border-b border-white/10">
          <span className="brand-lockup">
            <AtheusMark size={34} />
            <span className="text-lg font-black lowercase tracking-tight">atheus</span>
          </span>
          <button type="button" className="-m-2 p-2 text-chalk" aria-label="Close menu" onClick={() => setOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav className="container-studio flex flex-col pb-12 pt-4" aria-label="Mobile">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="type-display border-b border-white/10 py-5 text-4xl font-semibold tracking-tight transition-colors hover:text-acid"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={DISCORD_SERVER_URL}
            target="_blank"
            rel="noreferrer"
            className="type-display border-b border-white/10 py-5 text-4xl font-semibold tracking-tight transition-colors hover:text-acid"
            onClick={() => setOpen(false)}
          >
            Support
          </a>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="studio-button studio-button-primary mt-8 justify-center"
            onClick={() => setOpen(false)}
          >
            Add to Discord
          </a>
        </nav>
      </div>
    </>
  );
}

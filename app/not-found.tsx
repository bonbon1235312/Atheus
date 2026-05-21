import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for is no longer on the studio shelf.",
};

export default function NotFound() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="relative">
        <section className="section-pad">
          <div className="container-studio grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="kicker">Error · 404</p>
              <p
                className="type-display mt-6 text-[12rem] font-semibold leading-[0.82] tracking-[-0.04em] text-chalk md:text-[18rem]"
                aria-hidden="true"
              >
                404
              </p>
            </div>

            <div>
              <h1 className="type-display text-5xl font-semibold leading-[1.0] md:text-7xl">
                That page isn&apos;t on the studio shelf.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-chalk/68">
                The URL might have moved, the case study might have been retitled, or it might never have existed. Either way, here are the doors that work.
              </p>

              <div className="mt-10 grid gap-0 border-t border-white/15">
                <Link
                  href="/"
                  className="flex items-baseline justify-between gap-4 border-b border-white/15 py-5 transition-colors hover:text-acid"
                >
                  <span className="type-display text-3xl font-semibold leading-none md:text-4xl">Studio home</span>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">→</span>
                </Link>
                <Link
                  href="/work"
                  className="flex items-baseline justify-between gap-4 border-b border-white/15 py-5 transition-colors hover:text-acid"
                >
                  <span className="type-display text-3xl font-semibold leading-none md:text-4xl">Selected work</span>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">→</span>
                </Link>
                <Link
                  href="/services"
                  className="flex items-baseline justify-between gap-4 border-b border-white/15 py-5 transition-colors hover:text-acid"
                >
                  <span className="type-display text-3xl font-semibold leading-none md:text-4xl">Services</span>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">→</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-baseline justify-between gap-4 border-b border-white/15 py-5 transition-colors hover:text-acid"
                >
                  <span className="type-display text-3xl font-semibold leading-none md:text-4xl">Start a project</span>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">→</span>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/" className="studio-button studio-button-primary">
                  Back to studio
                </Link>
                <a href="mailto:hello@atheus.dev" className="studio-button studio-button-secondary">
                  hello@atheus.dev
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

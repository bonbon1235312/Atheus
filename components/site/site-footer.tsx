import Link from "next/link";
import { INVITE_URL, NAV_LINKS, SUPPORT_EMAIL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="container-studio grid gap-12 py-16 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <p className="type-display text-4xl font-semibold lowercase tracking-tight">atheus</p>
          <p className="mt-4 max-w-xs text-chalk/55">
            One bot for your whole Discord server. Roles, tickets, forms, giveaways,
            events and analytics, run from a real web dashboard.
          </p>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="studio-button studio-button-secondary mt-7 inline-flex"
          >
            Add to Discord
          </a>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-chalk/40">Product</p>
          <ul className="mt-4 grid gap-2.5 text-chalk/60">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-chalk">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-chalk/40">Contact</p>
          <a className="mt-4 block text-chalk/75 transition-colors hover:text-chalk" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

      <div className="container-studio flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 py-6 text-sm text-chalk/40">
        <span>Copyright {new Date().getFullYear()} atheus</span>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="transition-colors hover:text-chalk">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-chalk">Terms</Link>
          <span>atheus.dev</span>
        </div>
      </div>
    </footer>
  );
}

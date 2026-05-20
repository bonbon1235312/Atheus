import Link from "next/link";

const footerLinks = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="container-studio grid gap-10 py-16 md:grid-cols-[1.35fr_0.65fr_0.8fr]">
        <div>
          <p className="type-display text-7xl font-semibold leading-none">ATHEUS</p>
          <p className="mt-5 max-w-md text-chalk/64">
            Portfolio websites and lead generation sites with identity, motion,
            and enough confidence to make the business feel established.
          </p>
        </div>

        <div>
          <p className="text-sm font-black text-acid">Explore</p>
          <ul className="mt-4 grid gap-2 text-chalk/68">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-chalk">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-black text-acid">Contact</p>
          <a className="mt-4 block text-2xl font-semibold" href="mailto:hello@atheus.dev">
            hello@atheus.dev
          </a>
          <p className="mt-3 text-chalk/60">
            Selected launch projects available for independent businesses that
            fit the studio.
          </p>
        </div>
      </div>
      <div className="container-studio flex flex-wrap justify-between gap-3 border-t border-white/10 py-5 text-sm text-chalk/48">
        <span>Copyright {new Date().getFullYear()} ATHEUS.</span>
        <span>atheus.dev</span>
      </div>
    </footer>
  );
}

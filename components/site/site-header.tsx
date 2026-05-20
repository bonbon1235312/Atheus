import Link from "next/link";

const navItems = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="studio-header sticky top-0 z-50 border-b border-white/10">
      <div className="container-studio flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="brand-lockup" aria-label="ATHEUS home">
          <span className="brand-mark">
            A
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tight">ATHEUS</span>
            <span className="mt-1 hidden text-[11px] font-black uppercase text-acid sm:block">
              Portfolio studio
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 border border-white/12 p-1 text-xs font-black uppercase text-chalk/72 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="px-4 py-2 transition-colors hover:bg-chalk hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/contact" className="studio-button studio-button-primary hidden sm:inline-flex">
          Start a project
        </Link>
      </div>
    </header>
  );
}

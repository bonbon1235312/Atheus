import Link from "next/link";

const navItems = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/86 backdrop-blur-xl">
      <div className="container-studio flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="ATHEUS home">
          <span className="grid size-10 place-items-center border border-chalk/30 bg-chalk text-sm font-black text-ink">
            A
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-black">ATHEUS</span>
            <span className="mt-1 hidden text-xs text-chalk/54 sm:block">
              Creative web studio
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-chalk/72 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-chalk">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/contact" className="studio-button studio-button-primary">
          Start a project
        </Link>
      </div>
    </header>
  );
}

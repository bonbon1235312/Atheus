import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { AtheusMark } from "@/components/site/atheus-mark";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // --- Logged out: show the Discord sign-in screen instead of the dashboard.
  if (!session?.accessToken) {
    return (
      <main className="section-pad">
        <div className="container-studio grid min-h-[70vh] content-center gap-8">
          <div className="max-w-2xl">
            <p className="kicker">atheus dashboard</p>
            <h1 className="type-display mt-4 text-5xl font-semibold leading-[0.98] md:text-7xl">
              Configure your server <em className="italic text-acid">from the browser.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-chalk/68">
              Sign in with Discord to manage join roles, reaction roles and every
              atheus feature for the servers you run — no chat commands required.
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("discord", { redirectTo: "/dashboard" });
              }}
              className="mt-8"
            >
              <button type="submit" className="studio-button studio-button-primary">
                Continue with Discord
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // --- Logged in: dashboard chrome.
  const user = session.user;
  return (
    <div className="min-h-screen">
      <header className="studio-header sticky top-0 z-50 border-b border-white/10">
        <div className="container-studio flex min-h-20 items-center justify-between gap-4">
          <Link href="/dashboard" className="brand-lockup" aria-label="atheus dashboard">
            <AtheusMark size={34} />
            <span className="flex flex-col leading-none">
              <span className="text-xl font-black lowercase tracking-tight">atheus</span>
              <span className="mt-1 hidden text-[11px] font-black uppercase text-acid sm:block">
                Dashboard
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user?.name && (
              <span className="hidden text-sm text-chalk/68 sm:inline">{user.name}</span>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/dashboard" });
              }}
            >
              <button type="submit" className="studio-button studio-button-secondary">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}

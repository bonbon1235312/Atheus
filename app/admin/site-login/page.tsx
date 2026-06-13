import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteLoginForm } from "./site-login-form";

export const metadata = {
  title: "League site sign in",
};

export default async function SiteLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const session = await auth();
  if (session?.siteLeagueId) {
    redirect(`/admin/${session.siteLeagueId}`);
  }
  const { league = "" } = await searchParams;

  return (
    <main className="site-access-page">
      <div className="landing-ambient" aria-hidden="true" />
      <header>
        <Link className="landing-brand" href="/" aria-label="Atheus home">
          <span>A</span>
          <strong>atheus</strong>
        </Link>
        <Link href="/admin">Discord owner access</Link>
      </header>

      <section className="site-access-grid">
        <div>
          <p className="landing-status">
            <i />
            League-scoped administration
          </p>
          <h1>Open your league control room.</h1>
          <p>
            Use the address and credentials supplied by the league owner. This
            session can operate only one league and cannot change ownership,
            billing or staff access.
          </p>
        </div>
        <div className="site-access-panel">
          <div>
            <span>Secure site access</span>
            <small>One league / one boundary</small>
          </div>
          <SiteLoginForm leagueSlug={league} />
        </div>
      </section>
    </main>
  );
}

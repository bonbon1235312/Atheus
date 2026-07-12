import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { notFound } from "next/navigation";

import { getWcagOnColour } from "@/lib/accessible-colour";
import { getPublicLeagueAnyStatus } from "@/lib/public-league-data";
import { getTenantUrlBuilder } from "@/lib/tenant-url";

import { LeagueMark } from "./_components/league-mark";
import "./public.css";

type LeagueLayoutProps = {
  children: ReactNode;
  params: Promise<{ leagueSlug: string }>;
};

export async function generateMetadata({
  params,
}: LeagueLayoutProps): Promise<Metadata> {
  const { leagueSlug } = await params;
  const league = await getPublicLeagueAnyStatus(leagueSlug);

  if (!league) {
    return { title: "Atheus" };
  }

  if (league.status !== "active") {
    return {
      title: `${league.name} — Coming soon`,
      description: `${league.name} is being set up on Atheus.`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: league.name,
    description:
      league.description ||
      `Fixtures, standings, results and player statistics for ${league.name}.`,
  };
}

export default async function LeagueLayout({
  children,
  params,
}: LeagueLayoutProps) {
  const { leagueSlug } = await params;
  const [league, tenantUrl] = await Promise.all([
    getPublicLeagueAnyStatus(leagueSlug),
    getTenantUrlBuilder(leagueSlug),
  ]);

  if (!league) {
    notFound();
  }

  const isActive = league.status === "active";
  const style = {
    "--league-primary": league.branding.primary_colour,
    "--league-secondary": league.branding.secondary_colour,
    "--league-accent": league.branding.accent_colour,
    "--league-bg": league.branding.background_colour,
    "--league-surface": league.branding.surface_colour,
    "--league-text": league.branding.text_colour,
    "--league-muted": league.branding.muted_text_colour,
    "--league-on-primary": getWcagOnColour(league.branding.primary_colour),
    "--league-on-secondary": getWcagOnColour(
      league.branding.secondary_colour,
    ),
    "--league-on-accent": getWcagOnColour(league.branding.accent_colour),
    "--league-on-bg": getWcagOnColour(league.branding.background_colour),
    "--league-on-surface": getWcagOnColour(league.branding.surface_colour),
  } as CSSProperties;

  return (
    <div className="league-public-shell" style={style}>
      <header className="league-public-header">
        <Link className="league-public-brand" href={tenantUrl("/")}>
          <LeagueMark
            colour={league.branding.primary_colour}
            logoUrl={league.branding.logo_url}
            name={league.name}
          />
          <span>
            <strong>{league.short_name || league.name}</strong>
            <small>{isActive ? "League hub" : "Coming soon"}</small>
          </span>
        </Link>

        {isActive ? (
          <>
            <nav aria-label={`${league.name} navigation`}>
              <Link href={tenantUrl("/")}>Home</Link>
              <Link href={tenantUrl("/fixtures")}>Fixtures</Link>
              <Link href={tenantUrl("/table")}>Table</Link>
              <Link href={tenantUrl("/stats")}>Stats</Link>
            </nav>

            <Link
              className="league-admin-link"
              href={`/admin/site-login?league=${encodeURIComponent(leagueSlug)}`}
            >
              Admin
            </Link>
          </>
        ) : null}
      </header>

      {children}

      <footer className="league-public-footer">
        <span>{league.name}</span>
        <span>Powered by Atheus</span>
      </footer>
    </div>
  );
}

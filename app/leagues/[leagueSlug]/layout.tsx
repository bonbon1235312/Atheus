import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { getPublicLeague } from "@/lib/public-league-data";

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
  const league = await getPublicLeague(leagueSlug);

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
  const league = await getPublicLeague(leagueSlug);
  const style = {
    "--league-primary": league.branding.primary_colour,
    "--league-secondary": league.branding.secondary_colour,
    "--league-accent": league.branding.accent_colour,
    "--league-bg": league.branding.background_colour,
    "--league-surface": league.branding.surface_colour,
    "--league-text": league.branding.text_colour,
    "--league-muted": league.branding.muted_text_colour,
  } as CSSProperties;

  return (
    <div className="league-public-shell" style={style}>
      <header className="league-public-header">
        <Link className="league-public-brand" href={`/leagues/${leagueSlug}`}>
          <LeagueMark
            colour={league.branding.primary_colour}
            logoUrl={league.branding.logo_url}
            name={league.name}
          />
          <span>
            <strong>{league.short_name || league.name}</strong>
            <small>League hub</small>
          </span>
        </Link>

        <nav aria-label={`${league.name} navigation`}>
          <Link href={`/leagues/${leagueSlug}`}>Home</Link>
          <Link href={`/leagues/${leagueSlug}/fixtures`}>Fixtures</Link>
          <Link href={`/leagues/${leagueSlug}/table`}>Table</Link>
          <Link href={`/leagues/${leagueSlug}/stats`}>Stats</Link>
        </nav>

        <Link className="league-admin-link" href="/admin">
          Admin
        </Link>
      </header>

      {children}

      <footer className="league-public-footer">
        <span>{league.name}</span>
        <span>Powered by Atheus</span>
      </footer>
    </div>
  );
}

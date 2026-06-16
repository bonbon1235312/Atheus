import { headers } from "next/headers";
import Link from "next/link";

import { getPublicLeagueAnyStatus } from "@/lib/public-league-data";
import { leagueSlugFromHostname } from "@/lib/public-url";

import { LeagueMark } from "./_components/league-mark";

export default async function LeagueNotFound() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    "";
  const slug = leagueSlugFromHostname(host.split(",")[0].trim());
  const league = slug ? await getPublicLeagueAnyStatus(slug) : null;

  // A recognised but not-yet-activated league: show a friendly, branded
  // "coming soon" panel instead of the generic platform 404 so a prospective
  // member who visits the address before launch does not think it is broken.
  if (league && league.status !== "active") {
    const isDraft = league.status === "draft";

    return (
      <main className="league-coming-soon">
        <LeagueMark
          colour={league.branding.primary_colour}
          logoUrl={league.branding.logo_url}
          name={league.name}
        />
        <p className="public-kicker">
          {isDraft ? "Launching soon" : "Currently unavailable"}
        </p>
        <h1>{league.name}</h1>
        <p className="league-coming-soon-lead">
          {isDraft
            ? "This league is being set up on Atheus. Fixtures, the table and player stats will appear here once the season is published."
            : "This league is not accepting public visitors right now. Please check back later."}
        </p>
      </main>
    );
  }

  // Genuinely unknown route (unknown slug, or a missing sub-page on a live
  // league): keep the standard platform 404.
  return (
    <main className="league-coming-soon">
      <p className="public-kicker">404 / Not found</p>
      <h1>That route is not in the fixture list.</h1>
      <p className="league-coming-soon-lead">
        The page you are looking for could not be found.
      </p>
      <Link className="button button-primary" href="/">
        Return home
      </Link>
    </main>
  );
}

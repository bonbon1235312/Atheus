import type { CSSProperties } from "react";
import Link from "next/link";

import type { PublicFixture } from "@/lib/database.types";
import { formatKickoff } from "@/lib/public-league-data";
import type { TenantUrlBuilder } from "@/lib/tenant-url";

import { LeagueMark } from "./league-mark";

type FixtureRowProps = {
  fixture: PublicFixture;
  tenantUrl: TenantUrlBuilder;
  timezone: string;
};

export function FixtureRow({
  fixture,
  tenantUrl,
  timezone,
}: FixtureRowProps) {
  const hasResult = fixture.has_approved_result;
  const label =
    fixture.round_label ||
    (fixture.gameday_number ? `Gameday ${fixture.gameday_number}` : "Fixture");

  return (
    <article
      className="public-fixture-row"
      style={
        {
          "--home-colour":
            fixture.home_team_primary_colour ?? "transparent",
          "--away-colour":
            fixture.away_team_primary_colour ?? "transparent",
        } as CSSProperties
      }
    >
      <div className="fixture-context">
        <strong>{formatKickoff(fixture.kickoff_at, timezone)}</strong>
        <span>
          {fixture.competition_name} / {label}
        </span>
      </div>

      <Link
        className="fixture-team fixture-team-home"
        href={tenantUrl(`/teams/${fixture.home_team_slug}`)}
      >
        <span>{fixture.home_team_name}</span>
        <LeagueMark
          compact
          colour={fixture.home_team_primary_colour}
          logoUrl={fixture.home_team_logo_url}
          name={fixture.home_team_name}
        />
      </Link>

      <div className={`fixture-score${hasResult ? " fixture-score-final" : ""}`}>
        {hasResult ? (
          <>
            <b>{fixture.home_score}</b>
            <span>:</span>
            <b>{fixture.away_score}</b>
          </>
        ) : (
          <span>VS</span>
        )}
        {fixture.is_forfeit ? <small>FF</small> : null}
      </div>

      <Link
        className="fixture-team fixture-team-away"
        href={tenantUrl(`/teams/${fixture.away_team_slug}`)}
      >
        <LeagueMark
          compact
          colour={fixture.away_team_primary_colour}
          logoUrl={fixture.away_team_logo_url}
          name={fixture.away_team_name}
        />
        <span>{fixture.away_team_name}</span>
      </Link>
    </article>
  );
}

import Link from "next/link";

import type { Standing } from "@/lib/database.types";

import { LeagueMark } from "./league-mark";

type StandingsTableProps = {
  leagueSlug: string;
  rows: Standing[];
  compact?: boolean;
};

export function StandingsTable({
  leagueSlug,
  rows,
  compact = false,
}: StandingsTableProps) {
  return (
    <div className={`standings-table${compact ? " standings-table-compact" : ""}`}>
      <div className="standings-head" aria-hidden="true">
        <span>Pos</span>
        <span>Club</span>
        <span>P</span>
        <span>W</span>
        <span>D</span>
        <span>L</span>
        <span>GD</span>
        <span>Pts</span>
      </div>
      {rows.map((row, index) => (
        <Link
          className="standings-row"
          href={`/leagues/${leagueSlug}/teams/${row.team_slug}`}
          key={row.team_id}
        >
          <b className="standings-position">{index + 1}</b>
          <span className="standings-club">
            <LeagueMark
              compact
              colour={row.primary_colour}
              logoUrl={row.logo_url}
              name={row.team_name}
            />
            <span>
              <strong>{row.team_name}</strong>
              <small>{row.abbreviation || row.team_name.slice(0, 3)}</small>
            </span>
          </span>
          <b>{row.played}</b>
          <b>{row.won}</b>
          <b>{row.drawn}</b>
          <b>{row.lost}</b>
          <b className={row.goal_difference < 0 ? "metric-negative" : ""}>
            {row.goal_difference > 0 ? "+" : ""}
            {row.goal_difference}
          </b>
          <b className="standings-points">{row.points}</b>
        </Link>
      ))}
    </div>
  );
}

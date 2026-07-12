import Link from "next/link";

import type { Standing } from "@/lib/database.types";
import type { TenantUrlBuilder } from "@/lib/tenant-url";

import { LeagueMark } from "./league-mark";

type StandingsTableProps = {
  rows: Standing[];
  compact?: boolean;
  tenantUrl: TenantUrlBuilder;
};

export function StandingsTable({
  rows,
  compact = false,
  tenantUrl,
}: StandingsTableProps) {
  return (
    <div
      aria-label="League standings. Scroll horizontally to view all columns."
      className={`standings-table${compact ? " standings-table-compact" : ""}`}
      role="region"
      tabIndex={0}
    >
      <table className="standings-grid">
        <caption className="standings-caption">League standings</caption>
        <colgroup>
          <col className="standings-col-position" />
          <col />
          <col className="standings-col-result" span={4} />
          <col className="standings-col-difference" />
          <col className="standings-col-points" />
        </colgroup>
        <thead>
          <tr className="standings-head">
            <th scope="col">Pos</th>
            <th scope="col">Club</th>
            <th scope="col">
              <abbr title="Played">P</abbr>
            </th>
            <th scope="col">
              <abbr title="Won">W</abbr>
            </th>
            <th scope="col">
              <abbr title="Drawn">D</abbr>
            </th>
            <th scope="col">
              <abbr title="Lost">L</abbr>
            </th>
            <th scope="col">
              <abbr title="Goal difference">GD</abbr>
            </th>
            <th scope="col">
              <abbr title="Points">Pts</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className="standings-row" key={row.team_id}>
              <td>
                <span className="standings-position">{index + 1}</span>
              </td>
              <th className="standings-club-cell" scope="row">
                <Link
                  className="standings-club"
                  href={tenantUrl(`/teams/${row.team_slug}`)}
                >
                  <LeagueMark
                    compact
                    colour={row.primary_colour}
                    logoUrl={row.logo_url}
                    name={row.team_name}
                  />
                  <span>
                    <strong>{row.team_name}</strong>
                    <small>
                      {row.abbreviation || row.team_name.slice(0, 3)}
                    </small>
                  </span>
                </Link>
              </th>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td className={row.goal_difference < 0 ? "metric-negative" : ""}>
                {row.goal_difference > 0 ? "+" : ""}
                {row.goal_difference}
              </td>
              <td className="standings-points">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

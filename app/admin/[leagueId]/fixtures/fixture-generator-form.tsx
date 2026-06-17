"use client";

import { useActionState, useMemo, useState } from "react";

import {
  previewFixturePlan,
  publishFixturePlan,
  type FixturePreviewState,
  type FixturePublishState,
} from "@/app/admin/[leagueId]/fixtures/actions";

type CompetitionOption = {
  id: string;
  name: string;
  kind: string;
  seasonName: string;
};

type TeamOption = {
  id: string;
  name: string;
  abbreviation: string | null;
  eaReady: boolean;
};

const initialPreview: FixturePreviewState = {};
const initialPublish: FixturePublishState = {};

/**
 * Decide which teams should be ticked for a given competition. When a division
 * has an explicit roster (competition_teams), default to exactly that roster.
 * Divisions with no assignments fall back to every active team so the existing
 * single-table behaviour is unchanged.
 */
function rosterForCompetition(
  competitionId: string,
  assignments: Record<string, string[]>,
  teams: TeamOption[],
): Set<string> {
  const assigned = assignments[competitionId];
  if (assigned && assigned.length > 0) {
    return new Set(assigned);
  }
  return new Set(teams.map((team) => team.id));
}

function formatDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function FixtureGeneratorForm({
  leagueId,
  competitions,
  teams,
  defaultFirstDate,
  competitionAssignments,
}: {
  leagueId: string;
  competitions: CompetitionOption[];
  teams: TeamOption[];
  defaultFirstDate: string;
  competitionAssignments: Record<string, string[]>;
}) {
  const [preview, previewAction, previewPending] = useActionState(
    previewFixturePlan,
    initialPreview,
  );
  const [published, publishAction, publishPending] = useActionState(
    publishFixturePlan,
    initialPublish,
  );
  const firstCompetitionId = competitions[0]?.id ?? "";
  const [selectedCompetitionId, setSelectedCompetitionId] =
    useState(firstCompetitionId);
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(() =>
    rosterForCompetition(firstCompetitionId, competitionAssignments, teams),
  );

  const assignedCount =
    competitionAssignments[selectedCompetitionId]?.length ?? 0;
  const divisionRostered = assignedCount > 0;

  const orderedTeams = useMemo(() => {
    // Surface a division's own teams first so the picker reads as that roster.
    if (!divisionRostered) return teams;
    const roster = new Set(competitionAssignments[selectedCompetitionId] ?? []);
    return [...teams].sort((a, b) => {
      const aIn = roster.has(a.id) ? 0 : 1;
      const bIn = roster.has(b.id) ? 0 : 1;
      return aIn - bIn || a.name.localeCompare(b.name);
    });
  }, [teams, divisionRostered, competitionAssignments, selectedCompetitionId]);

  function onCompetitionChange(competitionId: string) {
    setSelectedCompetitionId(competitionId);
    setSelectedTeamIds(
      rosterForCompetition(competitionId, competitionAssignments, teams),
    );
  }

  function toggleTeam(teamId: string) {
    setSelectedTeamIds((current) => {
      const next = new Set(current);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  }

  const allChecked = selectedTeamIds.size === teams.length;

  return (
    <div className="fixture-generator">
      <form action={previewAction} className="fixture-generator-form">
        <input name="leagueId" type="hidden" value={leagueId} />

        <div className="field-grid">
          <label className="field field-wide">
            <span>Competition</span>
            <select
              name="competitionId"
              onChange={(event) => onCompetitionChange(event.target.value)}
              required
              value={selectedCompetitionId}
            >
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.seasonName} / {competition.name}
                  {competition.kind !== "league" ? " / manual format" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>First match date</span>
            <input
              defaultValue={defaultFirstDate}
              name="firstDate"
              required
              type="date"
            />
          </label>
          <label className="field">
            <span>Meetings per pair</span>
            <select defaultValue="2" name="meetingsPerPair">
              <option value="1">Once</option>
              <option value="2">Home and away</option>
              <option value="3">Three meetings</option>
              <option value="4">Four meetings</option>
            </select>
          </label>
          <label className="field">
            <span>Max matches per team on a game day</span>
            <select
              defaultValue="2"
              name="maxMatchesPerTeamPerGameDay"
            >
              <option value="1">1 match</option>
              <option value="2">2 matches</option>
              <option value="3">3 matches</option>
              <option value="4">4 matches</option>
            </select>
          </label>
          <label className="field">
            <span>Blackout dates</span>
            <input name="blackoutDates" placeholder="2026-12-24, 2026-12-31" />
          </label>
        </div>

        <fieldset className="team-picker">
          <div className="team-picker-heading">
            <legend>
              Participating teams
              <small className="team-picker-count">
                {selectedTeamIds.size} selected
                {divisionRostered
                  ? " / division roster applied"
                  : ""}
              </small>
            </legend>
            <button
              className="text-button"
              onClick={() =>
                setSelectedTeamIds(
                  allChecked
                    ? new Set()
                    : new Set(teams.map((team) => team.id)),
                )
              }
              type="button"
            >
              {allChecked ? "Clear all" : "Select all"}
            </button>
          </div>
          {divisionRostered ? (
            <p className="team-picker-note">
              Teams assigned to this division are ticked automatically. Adjust
              the selection below if this run should differ.
            </p>
          ) : null}
          <div>
            {orderedTeams.map((team) => (
              <label key={team.id}>
                <input
                  checked={selectedTeamIds.has(team.id)}
                  name="teamIds"
                  onChange={() => toggleTeam(team.id)}
                  type="checkbox"
                  value={team.id}
                />
                <span>
                  <strong>{team.name}</strong>
                  <small>
                    {team.abbreviation ?? "No abbreviation"} /{" "}
                    {team.eaReady ? "EA ready" : "EA link missing"}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {preview.error ? <p className="form-error">{preview.error}</p> : null}

        <button
          className="button button-primary"
          disabled={previewPending}
          type="submit"
        >
          {previewPending ? "Building preview..." : "Preview fixtures"}
        </button>
      </form>

      {preview.plan && preview.planToken ? (
        <section className="fixture-preview">
          <div className="fixture-preview-summary">
            <div>
              <span>Fixtures</span>
              <strong>{preview.plan.fixtureCount}</strong>
            </div>
            <div>
              <span>Per team</span>
              <strong>{preview.plan.fixturesPerTeam}</strong>
            </div>
            <div>
              <span>Game days</span>
              <strong>{preview.plan.gameDayCount}</strong>
            </div>
            <div>
              <span>Finishes</span>
              <strong>{preview.plan.finalLocalDate}</strong>
            </div>
          </div>

          {preview.plan.warnings.map((warning) => (
            <p className="installation-note" key={warning}>
              {warning}
            </p>
          ))}

          <div className="fixture-preview-list">
            {preview.plan.fixtures.map((fixture) => (
              <article key={fixture.externalFixtureKey}>
                <span>
                  {fixture.roundLabel}
                  <small>
                    {formatDate(fixture.kickoffAt, preview.plan!.timezone)}
                  </small>
                </span>
                <strong>{fixture.homeTeamName}</strong>
                <b>vs</b>
                <strong>{fixture.awayTeamName}</strong>
              </article>
            ))}
          </div>

          <form
            action={publishAction}
            className="fixture-publish"
            onSubmit={(event) => {
              if (
                !window.confirm(
                  `Publish ${preview.plan?.fixtureCount ?? 0} fixtures? This competition cannot be regenerated after publishing.`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input name="leagueId" type="hidden" value={leagueId} />
            <input
              name="planToken"
              type="hidden"
              value={preview.planToken}
            />
            <p>
              Publishing writes this exact signed preview. It cannot silently
              regenerate into a different schedule.
            </p>
            <button
              className="button button-primary"
              disabled={publishPending}
              type="submit"
            >
              {publishPending ? "Publishing..." : "Publish fixture plan"}
            </button>
          </form>
          {published.error ? (
            <p className="form-error">{published.error}</p>
          ) : null}
          {published.success ? (
            <p className="form-success">{published.success}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

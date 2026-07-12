"use client";

import { useActionState } from "react";

import type { Competition, Team } from "@/lib/database.types";

import {
  addTeamToDivision,
  createDivision,
  renameDivision,
  removeTeamFromDivision,
  type DivisionActionState,
} from "./actions";

type DivisionRef = Pick<Competition, "id" | "name" | "slug">;
type TeamRef = Pick<Team, "id" | "name" | "primary_colour">;
type CompetitionTeamRef = { competition_id: string; team_id: string };

const initialState: DivisionActionState = {};

function DivisionCard({
  division,
  teams,
  assignedTeamIds,
  leagueId,
}: {
  division: DivisionRef;
  teams: TeamRef[];
  assignedTeamIds: string[];
  leagueId: string;
}) {
  const [addState, addAction, addPending] = useActionState(
    addTeamToDivision,
    initialState,
  );
  const [renameState, renameAction, renamePending] = useActionState(
    renameDivision,
    initialState,
  );

  const assignedTeams = teams.filter((t) => assignedTeamIds.includes(t.id));
  const unassignedTeams = teams.filter((t) => !assignedTeamIds.includes(t.id));

  return (
    <div className="division-card">
      <div className="division-card-head">
        <form action={renameAction} className="division-rename-form">
          <input type="hidden" name="leagueId" value={leagueId} />
          <input type="hidden" name="competitionId" value={division.id} />
          <input
            defaultValue={division.name}
            name="name"
            className="division-name-input"
            required
          />
          <button
            className="text-button"
            disabled={renamePending}
            type="submit"
          >
            {renamePending ? "Saving..." : "Rename"}
          </button>
        </form>
        <small>{assignedTeamIds.length} team{assignedTeamIds.length !== 1 ? "s" : ""}</small>
        {renameState.error ? (
          <p className="inline-error" style={{ margin: 0 }}>
            {renameState.error}
          </p>
        ) : null}
        {renameState.success ? (
          <p className="form-success" style={{ margin: 0 }}>
            {renameState.success}
          </p>
        ) : null}
      </div>

      {assignedTeams.length > 0 ? (
        <div className="division-team-list">
          {assignedTeams.map((team) => (
            <form action={removeTeamFromDivision} key={team.id}>
              <input type="hidden" name="leagueId" value={leagueId} />
              <input type="hidden" name="competitionId" value={division.id} />
              <input type="hidden" name="teamId" value={team.id} />
              <div className="division-team-row">
                <span
                  className="team-colour-dot"
                  style={{
                    background: team.primary_colour ?? "var(--muted)",
                  }}
                />
                <span>{team.name}</span>
                <button className="text-button danger-text" type="submit">
                  Remove
                </button>
              </div>
            </form>
          ))}
        </div>
      ) : (
        <p className="empty-state" style={{ margin: 0, padding: "14px 0" }}>
          No teams assigned yet.
        </p>
      )}

      {unassignedTeams.length > 0 ? (
        <form action={addAction} className="division-add-form">
          <input type="hidden" name="leagueId" value={leagueId} />
          <input type="hidden" name="competitionId" value={division.id} />
          <div className="division-add-row">
            <label className="field" style={{ flex: 1 }}>
              <span>Add team</span>
              <select name="teamId" required>
                <option value="">Select a team...</option>
                {unassignedTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button button-primary"
              disabled={addPending}
              style={{ alignSelf: "flex-end" }}
              type="submit"
            >
              {addPending ? "Adding..." : "Add"}
            </button>
          </div>
          {addState.error ? (
            <p className="inline-error">{addState.error}</p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

export function DivisionPanel({
  leagueId,
  seasonId,
  divisions,
  teams,
  competitionTeams,
}: {
  leagueId: string;
  seasonId: string;
  divisions: DivisionRef[];
  teams: TeamRef[];
  competitionTeams: CompetitionTeamRef[];
}) {
  const [createState, createAction, createPending] = useActionState(
    createDivision,
    initialState,
  );

  return (
    <div className="divisions-shell">
      {divisions.length > 0 ? (
        <div className="division-list">
          {divisions.map((division) => {
            const assignedTeamIds = competitionTeams
              .filter((ct) => ct.competition_id === division.id)
              .map((ct) => ct.team_id);
            return (
              <DivisionCard
                assignedTeamIds={assignedTeamIds}
                division={division}
                key={division.id}
                leagueId={leagueId}
                teams={teams}
              />
            );
          })}
        </div>
      ) : (
        <p className="empty-state">
          No divisions yet. Create one below — the fixture generator and public
          standings table will use each division&apos;s team list.
        </p>
      )}

      <div className="setup-shell">
        <div className="section-title-row">
          <p className="step-index">New division</p>
          <h2>Add division</h2>
        </div>
        <form action={createAction} className="season-form">
          <input type="hidden" name="leagueId" value={leagueId} />
          <input type="hidden" name="seasonId" value={seasonId} />
          <div className="field-grid">
            <label className="field">
              <span>Division name</span>
              <input
                name="name"
                placeholder="Division 1"
                required
              />
            </label>
            <label className="field">
              <span>Address slug (auto-filled)</span>
              <input
                name="slug"
                placeholder="division-1"
              />
              <small>
                Leave blank to auto-generate from the name. Lowercase, hyphens
                only.
              </small>
            </label>
          </div>
          {createState.error ? (
            <p className="form-error">{createState.error}</p>
          ) : null}
          {createState.success ? (
            <p className="form-success">{createState.success}</p>
          ) : null}
          <button
            className="button button-primary"
            disabled={createPending}
            type="submit"
          >
            {createPending ? "Creating..." : "Create division"}
          </button>
        </form>
      </div>
    </div>
  );
}

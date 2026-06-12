"use client";

import { useActionState, useState } from "react";

import {
  eraseFixturePlayerStats,
  manageFixtureLifecycle,
  overrideFixtureResult,
  type FixtureControlState,
} from "./actions";

const initialState: FixtureControlState = {};

type FixtureControlsProps = {
  fixtureId: string;
  leagueId: string;
  localKickoff: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  isForfeit: boolean;
  canManageSchedule: boolean;
  canReviewResults: boolean;
};

export function FixtureControls({
  fixtureId,
  leagueId,
  localKickoff,
  status,
  homeScore,
  awayScore,
  isForfeit,
  canManageSchedule,
  canReviewResults,
}: FixtureControlsProps) {
  const [fixtureAction, setFixtureAction] = useState("reschedule");
  const [lifecycleState, lifecycleAction, lifecyclePending] = useActionState(
    manageFixtureLifecycle,
    initialState,
  );
  const [resultState, resultAction, resultPending] = useActionState(
    overrideFixtureResult,
    initialState,
  );
  const [eraseState, eraseAction, erasePending] = useActionState(
    eraseFixturePlayerStats,
    initialState,
  );

  if (!canManageSchedule && !canReviewResults) {
    return null;
  }

  return (
    <details className="fixture-controls">
      <summary>Manage</summary>
      <div className="fixture-controls-grid">
        {canManageSchedule && status !== "completed" ? (
          <form action={lifecycleAction} className="fixture-control-form">
            <input name="leagueId" type="hidden" value={leagueId} />
            <input name="fixtureId" type="hidden" value={fixtureId} />
            <label className="field">
              <span>Fixture action</span>
              <select
                name="fixtureAction"
                onChange={(event) => setFixtureAction(event.target.value)}
                value={fixtureAction}
              >
                <option value="reschedule">Reschedule</option>
                <option value="postpone">Postpone</option>
                <option value="cancel">Cancel / no play</option>
                <option value="restore">Restore to schedule</option>
              </select>
            </label>
            {fixtureAction === "reschedule" ? (
              <label className="field">
                <span>New local kickoff</span>
                <input
                  defaultValue={localKickoff}
                  name="localKickoff"
                  required
                  type="datetime-local"
                />
              </label>
            ) : null}
            <label className="field">
              <span>Reason</span>
              <input
                name="reason"
                placeholder="Visible in the audit trail"
                required
              />
            </label>
            {lifecycleState.error ? (
              <p className="inline-error">{lifecycleState.error}</p>
            ) : null}
            {lifecycleState.success ? (
              <p className="form-success">{lifecycleState.success}</p>
            ) : null}
            <button
              className="button button-secondary"
              disabled={lifecyclePending}
              type="submit"
            >
              {lifecyclePending ? "Saving..." : "Apply fixture change"}
            </button>
          </form>
        ) : null}

        {canReviewResults && status !== "cancelled" ? (
          <form action={resultAction} className="fixture-control-form">
            <input name="leagueId" type="hidden" value={leagueId} />
            <input name="fixtureId" type="hidden" value={fixtureId} />
            <div className="score-inputs">
              <label className="field">
                <span>Home</span>
                <input
                  defaultValue={homeScore ?? ""}
                  min="0"
                  name="homeScore"
                  required
                  type="number"
                />
              </label>
              <label className="field">
                <span>Away</span>
                <input
                  defaultValue={awayScore ?? ""}
                  min="0"
                  name="awayScore"
                  required
                  type="number"
                />
              </label>
            </div>
            <label className="check-row">
              <input defaultChecked={isForfeit} name="isForfeit" type="checkbox" />
              <span>Forfeit result</span>
            </label>
            <label className="check-row">
              <input name="erasePlayerStats" type="checkbox" />
              <span>Erase existing player stats attached to this match</span>
            </label>
            <label className="field">
              <span>Correction reason</span>
              <input
                name="reason"
                placeholder="Required for every manual score"
                required
              />
            </label>
            {resultState.error ? (
              <p className="inline-error">{resultState.error}</p>
            ) : null}
            {resultState.success ? (
              <p className="form-success">{resultState.success}</p>
            ) : null}
            <button
              className="button button-primary"
              disabled={resultPending}
              type="submit"
            >
              {resultPending ? "Publishing..." : "Save result override"}
            </button>
          </form>
        ) : null}

        {canReviewResults && status === "completed" ? (
          <form action={eraseAction} className="fixture-control-form danger-form">
            <input name="leagueId" type="hidden" value={leagueId} />
            <input name="fixtureId" type="hidden" value={fixtureId} />
            <p>
              Remove all approved player rows for this fixture while preserving
              the scoreline.
            </p>
            <label className="field">
              <span>Reason</span>
              <input name="reason" required />
            </label>
            <label className="field">
              <span>Type ERASE to confirm</span>
              <input autoComplete="off" name="confirmation" required />
            </label>
            {eraseState.error ? (
              <p className="inline-error">{eraseState.error}</p>
            ) : null}
            {eraseState.success ? (
              <p className="form-success">{eraseState.success}</p>
            ) : null}
            <button
              className="button button-danger"
              disabled={erasePending}
              type="submit"
            >
              {erasePending ? "Erasing..." : "Erase player stats"}
            </button>
          </form>
        ) : null}
      </div>
    </details>
  );
}

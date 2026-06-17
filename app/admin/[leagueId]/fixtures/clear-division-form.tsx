"use client";

import { useActionState, useState } from "react";

import {
  clearDivisionFixtures,
  type FixtureControlState,
} from "./actions";

type ClearableDivision = {
  id: string;
  name: string;
  seasonName: string;
  fixtureCount: number;
};

const initialState: FixtureControlState = {};

export function ClearDivisionForm({
  leagueId,
  divisions,
}: {
  leagueId: string;
  divisions: ClearableDivision[];
}) {
  const [state, action, pending] = useActionState(
    clearDivisionFixtures,
    initialState,
  );
  const [selectedId, setSelectedId] = useState(divisions[0]?.id ?? "");

  const selected = divisions.find((division) => division.id === selectedId);

  return (
    <details className="clear-division">
      <summary>Clear a division&apos;s schedule</summary>
      <form action={action} className="fixture-control-form danger-form">
        <input name="leagueId" type="hidden" value={leagueId} />
        <p>
          Deletes every fixture in the selected division so it can be generated
          again. Blocked automatically if any fixture already has an approved
          result or a collected match import — nothing real can be wiped.
        </p>
        <label className="field">
          <span>Division</span>
          <select
            name="competitionId"
            onChange={(event) => setSelectedId(event.target.value)}
            value={selectedId}
          >
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.seasonName} / {division.name} — {division.fixtureCount}{" "}
                fixture{division.fixtureCount === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Type CLEAR to confirm</span>
          <input autoComplete="off" name="confirmation" required />
        </label>
        {state.error ? <p className="inline-error">{state.error}</p> : null}
        {state.success ? <p className="form-success">{state.success}</p> : null}
        <button className="button button-danger" disabled={pending} type="submit">
          {pending
            ? "Clearing..."
            : selected
              ? `Clear ${selected.fixtureCount} fixture${selected.fixtureCount === 1 ? "" : "s"}`
              : "Clear schedule"}
        </button>
      </form>
    </details>
  );
}

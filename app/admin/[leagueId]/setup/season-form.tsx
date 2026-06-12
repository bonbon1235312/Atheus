"use client";

import { useActionState } from "react";

import {
  configureSeason,
  type ConfigureSeasonState,
} from "@/app/admin/[leagueId]/setup/actions";

const initialState: ConfigureSeasonState = {};

const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export function SeasonForm({ leagueId }: { leagueId: string }) {
  const [state, action, pending] = useActionState(
    configureSeason,
    initialState,
  );

  return (
    <form action={action} className="season-form">
      <input name="leagueId" type="hidden" value={leagueId} />

      <div className="field-grid">
        <label className="field field-wide">
          <span>Season name</span>
          <input name="seasonName" placeholder="Season 1" required />
        </label>
        <label className="field">
          <span>Starts on</span>
          <input name="startsOn" type="date" />
        </label>
        <label className="field">
          <span>Ends on</span>
          <input name="endsOn" type="date" />
        </label>
      </div>

      <fieldset className="day-picker">
        <legend>Regular matchdays</legend>
        <div>
          {weekdays.map((day) => (
            <label key={day.value}>
              <input name="weekdays" type="checkbox" value={day.value} />
              <span>{day.label.slice(0, 3)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Kickoff times</span>
        <input
          inputMode="numeric"
          name="kickoffTimes"
          placeholder="20:00, 20:30"
          required
        />
        <small>
          Use league-local 24-hour times, separated by commas. Atheus stores the
          schedule in the league timezone and converts actual fixtures to UTC.
        </small>
      </label>

      <label className="check-row">
        <input name="includeCup" type="checkbox" />
        <span>Create a cup competition alongside the league</span>
      </label>

      {state.error ? <p className="form-error">{state.error}</p> : null}

      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "Saving foundation..." : "Save season and match windows"}
      </button>
    </form>
  );
}

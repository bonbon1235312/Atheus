"use client";

import { useActionState } from "react";

import {
  saveStaffMember,
  type StaffActionState,
} from "@/app/admin/[leagueId]/staff/actions";

const initialState: StaffActionState = {};

export function StaffForm({ leagueId }: { leagueId: string }) {
  const [state, action, pending] = useActionState(
    saveStaffMember,
    initialState,
  );

  return (
    <form action={action} className="staff-form">
      <input name="leagueId" type="hidden" value={leagueId} />
      <label className="field">
        <span>Discord user ID</span>
        <input
          inputMode="numeric"
          name="discordUserId"
          placeholder="123456789012345678"
          required
        />
        <small>
          Enable Discord Developer Mode, then right-click the person and choose
          Copy User ID.
        </small>
      </label>
      <label className="field">
        <span>League role</span>
        <select defaultValue="reviewer" name="role">
          <option value="admin">Admin / teams and setup</option>
          <option value="fixture_manager">Fixture manager</option>
          <option value="reviewer">Match reviewer</option>
        </select>
      </label>
      {state.error ? <p className="inline-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "Saving access..." : "Add or update staff"}
      </button>
    </form>
  );
}

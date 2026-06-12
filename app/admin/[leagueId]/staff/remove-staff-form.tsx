"use client";

import { useActionState } from "react";

import {
  removeStaffMember,
  type StaffActionState,
} from "@/app/admin/[leagueId]/staff/actions";

const initialState: StaffActionState = {};

export function RemoveStaffForm({
  leagueId,
  discordUserId,
}: {
  leagueId: string;
  discordUserId: string;
}) {
  const [state, action, pending] = useActionState(
    removeStaffMember,
    initialState,
  );

  return (
    <form action={action} className="remove-staff-form">
      <input name="leagueId" type="hidden" value={leagueId} />
      <input name="discordUserId" type="hidden" value={discordUserId} />
      {state.error ? <span className="danger-text">{state.error}</span> : null}
      <button className="text-button danger-text" disabled={pending} type="submit">
        {pending ? "Removing..." : "Remove"}
      </button>
    </form>
  );
}

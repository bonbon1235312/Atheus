"use client";

import { useActionState } from "react";

import {
  activateLeague,
  type ActivationState,
} from "@/app/admin/[leagueId]/actions";

const initialState: ActivationState = {};

export function ActivationForm({
  leagueId,
  ready,
}: {
  leagueId: string;
  ready: boolean;
}) {
  const [state, action, pending] = useActionState(activateLeague, initialState);

  return (
    <form action={action} className="activation-form">
      <input name="leagueId" type="hidden" value={leagueId} />
      {state.error ? <p className="inline-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
      <button
        className="button button-primary"
        disabled={!ready || pending}
        type="submit"
      >
        {pending ? "Rechecking Discord..." : "Activate league"}
      </button>
    </form>
  );
}

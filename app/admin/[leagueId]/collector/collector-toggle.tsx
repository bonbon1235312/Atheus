"use client";

import { useActionState } from "react";

import {
  setCollectorEnabled,
  type CollectorActionState,
} from "./actions";

const initialState: CollectorActionState = {};

export function CollectorToggle({
  leagueId,
  enabled,
  canManage,
}: {
  leagueId: string;
  enabled: boolean;
  canManage: boolean;
}) {
  const action = setCollectorEnabled.bind(null, leagueId, !enabled);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (!canManage) {
    return (
      <span className="status-chip">
        {enabled ? "Automation enabled" : "Owner setup required"}
      </span>
    );
  }

  return (
    <form action={formAction} className="collector-toggle">
      <button className="button button-primary" disabled={pending} type="submit">
        {pending
          ? "Saving..."
          : enabled
            ? "Pause collector"
            : "Enable collector"}
      </button>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? (
        <p className="form-success">{state.success}</p>
      ) : null}
    </form>
  );
}

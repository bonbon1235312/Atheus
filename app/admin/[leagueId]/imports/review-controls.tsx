"use client";

import { useActionState } from "react";

import {
  approveImport,
  rejectImport,
  type ImportReviewState,
} from "@/app/admin/[leagueId]/imports/actions";

const initialState: ImportReviewState = {};

export function ReviewControls({
  importId,
  leagueId,
}: {
  importId: string;
  leagueId: string;
}) {
  const [approveState, approveAction, approving] = useActionState(
    approveImport,
    initialState,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectImport,
    initialState,
  );

  return (
    <div className="review-controls">
      <form action={approveAction}>
        <input name="leagueId" type="hidden" value={leagueId} />
        <input name="importId" type="hidden" value={importId} />
        <label className="field">
          <span>Review note (optional)</span>
          <input name="note" placeholder="Why this package is trusted" />
        </label>
        {approveState.error ? (
          <p className="inline-error">{approveState.error}</p>
        ) : null}
        {approveState.success ? (
          <p className="form-success">{approveState.success}</p>
        ) : null}
        <button className="button button-primary" disabled={approving} type="submit">
          {approving ? "Publishing..." : "Approve stats"}
        </button>
      </form>
      <form action={rejectAction}>
        <input name="leagueId" type="hidden" value={leagueId} />
        <input name="importId" type="hidden" value={importId} />
        <label className="field">
          <span>Rejection reason</span>
          <input name="note" placeholder="Wrong match, score or teams" required />
        </label>
        {rejectState.error ? (
          <p className="inline-error">{rejectState.error}</p>
        ) : null}
        {rejectState.success ? (
          <p className="form-success">{rejectState.success}</p>
        ) : null}
        <button className="button button-secondary" disabled={rejecting} type="submit">
          {rejecting ? "Rejecting..." : "Reject package"}
        </button>
      </form>
    </div>
  );
}

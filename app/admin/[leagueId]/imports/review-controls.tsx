"use client";

import { useActionState, useId, useState } from "react";

import {
  approveImport,
  rejectImport,
  type ImportReviewState,
} from "@/app/admin/[leagueId]/imports/actions";

const initialState: ImportReviewState = {};

export function ReviewControls({
  canScoreOnlyOverride,
  importId,
  leagueId,
  scoreOnly,
}: {
  canScoreOnlyOverride: boolean;
  importId: string;
  leagueId: string;
  scoreOnly: boolean;
}) {
  const [scoreOnlyConfirmed, setScoreOnlyConfirmed] = useState(false);
  const approveStatusId = useId();
  const overrideDescriptionId = useId();
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
        <input
          name="scoreOnlyOverride"
          type="hidden"
          value={scoreOnly && scoreOnlyConfirmed ? "true" : "false"}
        />
        {scoreOnly ? (
          <div className="score-only-review" role="note">
            <strong>No player telemetry was supplied.</strong>
            <p id={overrideDescriptionId}>
              Publishing will update the fixture and table without adding player
              appearances or statistics. The decision is permanently audited.
            </p>
            {canScoreOnlyOverride ? (
              <label className="score-only-confirmation">
                <input
                  aria-describedby={overrideDescriptionId}
                  checked={scoreOnlyConfirmed}
                  onChange={(event) => setScoreOnlyConfirmed(event.target.checked)}
                  type="checkbox"
                />
                <span>Publish this score without player statistics</span>
              </label>
            ) : (
              <p className="inline-error">
                A league owner or admin must review this package.
              </p>
            )}
          </div>
        ) : null}
        <label className="field">
          <span>{scoreOnly ? "Override reason" : "Review note (optional)"}</span>
          <input
            aria-describedby={scoreOnly ? overrideDescriptionId : undefined}
            name="note"
            placeholder={
              scoreOnly
                ? "Why publishing without player stats is correct"
                : "Why this package is trusted"
            }
            required={scoreOnly && scoreOnlyConfirmed}
          />
        </label>
        <div aria-live="polite" id={approveStatusId}>
          {approveState.error ? (
            <p className="inline-error">{approveState.error}</p>
          ) : null}
          {approveState.success ? (
            <p className="form-success">{approveState.success}</p>
          ) : null}
        </div>
        <button
          aria-describedby={scoreOnly ? overrideDescriptionId : approveStatusId}
          className="button button-primary"
          disabled={
            approving ||
            (scoreOnly && (!canScoreOnlyOverride || !scoreOnlyConfirmed))
          }
          type="submit"
        >
          {approving
            ? "Publishing..."
            : scoreOnly
              ? "Publish score only"
              : "Approve stats"}
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

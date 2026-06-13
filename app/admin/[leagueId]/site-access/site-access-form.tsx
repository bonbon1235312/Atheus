"use client";

import { useActionState } from "react";

import {
  updateSiteCredential,
  type SiteAccessState,
} from "./actions";

const initialState: SiteAccessState = {};

export function SiteAccessForm({
  leagueId,
  username,
}: {
  leagueId: string;
  username: string;
}) {
  const [state, action, pending] = useActionState(
    updateSiteCredential,
    initialState,
  );

  return (
    <form action={action} className="onboarding-form site-credential-form">
      <input name="leagueId" type="hidden" value={leagueId} />
      <div className="form-section">
        <div>
          <p className="step-index">Credential</p>
          <h2>Rotate site access</h2>
        </div>
        <div className="field-grid">
          <label className="field field-wide">
            <span>Administrator username</span>
            <input
              autoComplete="username"
              defaultValue={username}
              maxLength={32}
              minLength={3}
              name="siteUsername"
              pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}"
              required
            />
          </label>
          <label className="field">
            <span>New password</span>
            <input
              autoComplete="new-password"
              maxLength={128}
              minLength={12}
              name="sitePassword"
              required
              type="password"
            />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input
              autoComplete="new-password"
              maxLength={128}
              minLength={12}
              name="sitePasswordConfirm"
              required
              type="password"
            />
          </label>
          <p className="field-help field-wide">
            Passwords are never displayed or recoverable. Rotating the
            credential also clears failed-login lockouts.
          </p>
        </div>
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
      <button
        className="button button-primary submit-button"
        disabled={pending}
        type="submit"
      >
        {pending ? "Securing access..." : "Save site credentials"}
      </button>
    </form>
  );
}

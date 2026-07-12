"use client";

import { useActionState, useId } from "react";

import {
  siteAdminSignIn,
  type SiteLoginState,
} from "@/app/admin/site-login/actions";

const initialState: SiteLoginState = {};

export function SiteLoginForm({
  leagueSlug = "",
  lockLeague = false,
}: {
  leagueSlug?: string;
  lockLeague?: boolean;
}) {
  const [state, action, pending] = useActionState(
    siteAdminSignIn,
    initialState,
  );
  const statusId = useId();
  const hasError = Boolean(state.error) && !pending;
  const statusMessage = pending
    ? "Checking access..."
    : hasError
      ? state.error
      : "\u00A0";

  return (
    <form action={action} aria-busy={pending} className="site-login-form">
      {lockLeague ? (
        <>
          <input name="leagueSlug" type="hidden" value={leagueSlug} />
          <div className="site-login-league">
            <span>League control room</span>
            <strong>{leagueSlug}.atheus.dev</strong>
          </div>
        </>
      ) : (
        <label>
          <span>League address</span>
          <div className="slug-input">
            <input
              aria-describedby={statusId}
              aria-invalid={hasError}
              autoCapitalize="none"
              autoComplete="organization"
              defaultValue={leagueSlug}
              name="leagueSlug"
              placeholder="northstar-pro-league"
              required
            />
            <small>.atheus.dev</small>
          </div>
        </label>
      )}
      <label>
        <span>Administrator username</span>
        <input
          aria-describedby={statusId}
          aria-invalid={hasError}
          autoCapitalize="none"
          autoComplete="username"
          name="username"
          required
        />
      </label>
      <label>
        <span>Password</span>
        <input
          aria-describedby={statusId}
          aria-invalid={hasError}
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>
      <p
        aria-atomic="true"
        aria-live="polite"
        className="site-login-error"
        id={statusId}
        role="status"
        style={
          hasError
            ? { minBlockSize: "5.5rem" }
            : {
                background: "transparent",
                borderLeftColor: "transparent",
                color: pending ? "#c7cbff" : "transparent",
                minBlockSize: "5.5rem",
              }
        }
      >
        {statusMessage}
      </p>
      <button
        className="landing-button landing-button-primary"
        disabled={pending}
        type="submit"
      >
        {pending ? "Checking access..." : "Open league control"}
      </button>
    </form>
  );
}

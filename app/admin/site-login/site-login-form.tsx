"use client";

import { useActionState } from "react";

import {
  siteAdminSignIn,
  type SiteLoginState,
} from "@/app/admin/site-login/actions";

const initialState: SiteLoginState = {};

export function SiteLoginForm({ leagueSlug = "" }: { leagueSlug?: string }) {
  const [state, action, pending] = useActionState(
    siteAdminSignIn,
    initialState,
  );

  return (
    <form action={action} className="site-login-form">
      <label>
        <span>League address</span>
        <div className="slug-input">
          <small>/leagues/</small>
          <input
            autoCapitalize="none"
            autoComplete="organization"
            defaultValue={leagueSlug}
            name="leagueSlug"
            placeholder="northstar-pro-league"
            required
          />
        </div>
      </label>
      <label>
        <span>Administrator username</span>
        <input
          autoCapitalize="none"
          autoComplete="username"
          name="username"
          required
        />
      </label>
      <label>
        <span>Password</span>
        <input
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>
      {state.error ? <p className="site-login-error">{state.error}</p> : null}
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

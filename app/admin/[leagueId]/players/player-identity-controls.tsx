"use client";

import { useActionState } from "react";

import {
  addPlayerAlias,
  mergePlayerIdentities,
  removePlayerAlias,
  type PlayerIdentityActionState,
  updatePlayerIdentity,
} from "./actions";

type TeamOption = {
  id: string;
  name: string;
};

type PlayerOption = {
  id: string;
  name: string;
};

type Alias = {
  id: string;
  alias: string;
  normalizedAlias: string;
  source: string;
};

const initialState: PlayerIdentityActionState = {};

export function PlayerIdentityControls({
  leagueId,
  identity,
  aliases,
  teams,
}: {
  leagueId: string;
  identity: {
    id: string;
    canonicalName: string;
    normalizedName: string;
    discordUserId: string | null;
    currentTeamId: string | null;
  };
  aliases: Alias[];
  teams: TeamOption[];
}) {
  const [identityState, identityAction, identityPending] = useActionState(
    updatePlayerIdentity,
    initialState,
  );
  const [aliasState, aliasAction, aliasPending] = useActionState(
    addPlayerAlias,
    initialState,
  );

  return (
    <details className="player-identity-details">
      <summary>Manage identity</summary>
      <div className="player-identity-panel">
        <form action={identityAction} className="identity-form">
          <input name="leagueId" type="hidden" value={leagueId} />
          <input name="identityId" type="hidden" value={identity.id} />
          <div className="field-grid">
            <label className="field">
              <span>Canonical gamertag</span>
              <input
                defaultValue={identity.canonicalName}
                name="canonicalName"
                required
              />
            </label>
            <label className="field">
              <span>Discord user ID</span>
              <input
                defaultValue={identity.discordUserId ?? ""}
                inputMode="numeric"
                name="playerDiscordUserId"
                placeholder="Optional"
              />
            </label>
            <label className="field">
              <span>Current team</span>
              <select
                defaultValue={identity.currentTeamId ?? ""}
                name="currentTeamId"
              >
                <option value="">No current team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Correction reason</span>
              <input name="reason" placeholder="Required for audit log" required />
            </label>
          </div>
          <button
            className="button button-secondary"
            disabled={identityPending}
            type="submit"
          >
            {identityPending ? "Saving..." : "Save identity"}
          </button>
          {identityState.error ? (
            <p className="form-error">{identityState.error}</p>
          ) : null}
          {identityState.success ? (
            <p className="form-success">{identityState.success}</p>
          ) : null}
        </form>

        <div className="identity-aliases">
          <p className="step-index">Known gamertags</p>
          {aliases.length ? (
            <div className="alias-list">
              {aliases.map((alias) => (
                <div key={alias.id}>
                  <span>
                    <strong>{alias.alias}</strong>
                    <small>{alias.source}</small>
                  </span>
                  {alias.normalizedAlias !== identity.normalizedName ? (
                    <form
                      action={removePlayerAlias}
                      onSubmit={(event) => {
                        if (!window.confirm(`Remove alias ${alias.alias}?`)) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input name="leagueId" type="hidden" value={leagueId} />
                      <input name="aliasId" type="hidden" value={alias.id} />
                      <input
                        name="reason"
                        type="hidden"
                        value={`Removed alias ${alias.alias} from identity registry`}
                      />
                      <button className="text-button danger-text" type="submit">
                        Remove
                      </button>
                    </form>
                  ) : (
                    <small>Canonical</small>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="inline-note">No aliases have been recorded yet.</p>
          )}
          <form action={aliasAction} className="alias-form">
            <input name="leagueId" type="hidden" value={leagueId} />
            <input name="identityId" type="hidden" value={identity.id} />
            <label className="field">
              <span>Add previous or alternate gamertag</span>
              <input name="alias" placeholder="Previous gamertag" required />
            </label>
            <label className="field">
              <span>Reason</span>
              <input name="reason" placeholder="Required for audit log" required />
            </label>
            <button
              className="button button-secondary"
              disabled={aliasPending}
              type="submit"
            >
              {aliasPending ? "Adding..." : "Add alias"}
            </button>
            {aliasState.error ? (
              <p className="form-error">{aliasState.error}</p>
            ) : null}
            {aliasState.success ? (
              <p className="form-success">{aliasState.success}</p>
            ) : null}
          </form>
        </div>
      </div>
    </details>
  );
}

export function IdentityMergeForm({
  leagueId,
  players,
}: {
  leagueId: string;
  players: PlayerOption[];
}) {
  const [state, action, pending] = useActionState(
    mergePlayerIdentities,
    initialState,
  );

  return (
    <form
      action={action}
      className="identity-merge-form"
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Merge the duplicate into the target identity? This rewrites canonical player references and cannot be undone from the website.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <div className="field-grid">
        <label className="field">
          <span>Duplicate identity</span>
          <select name="sourceIdentityId" required>
            <option value="">Choose duplicate</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Keep this identity</span>
          <select name="targetIdentityId" required>
            <option value="">Choose canonical player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-wide">
          <span>Merge reason</span>
          <input
            name="reason"
            placeholder="How you confirmed these are the same player"
            required
          />
        </label>
      </div>
      <input name="leagueId" type="hidden" value={leagueId} />
      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "Merging identities..." : "Merge duplicate"}
      </button>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";

import {
  createTeam,
  linkTeamEaClub,
  type TeamActionState,
  unlinkTeamEaClub,
} from "@/app/admin/[leagueId]/teams/actions";

type SearchCandidate = {
  clubId: string;
  name: string;
  platform: string;
  currentDivision: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  gamesPlayed: number | null;
  selectionToken: string;
};

type ActiveLink = {
  ea_club_id: string;
  ea_club_name: string;
  platform: string;
  verified_at: string | null;
};

type TeamSummary = {
  id: string;
  name: string;
  abbreviation: string | null;
  discord_role_id: string | null;
  primary_colour: string | null;
  secondary_colour: string | null;
  activeLink: ActiveLink | null;
};

const initialState: TeamActionState = {};

function record(candidate: SearchCandidate) {
  if (
    candidate.wins === null ||
    candidate.draws === null ||
    candidate.losses === null
  ) {
    return candidate.gamesPlayed === null
      ? "Record unavailable"
      : `${candidate.gamesPlayed} games`;
  }

  return `${candidate.wins}W ${candidate.draws}D ${candidate.losses}L`;
}

function EaClubSearch({
  leagueId,
  defaultPlatform,
  selected,
  onSelect,
}: {
  leagueId: string;
  defaultPlatform: string;
  selected: SearchCandidate | null;
  onSelect: (candidate: SearchCandidate | null) => void;
}) {
  const [clubName, setClubName] = useState("");
  const [platform, setPlatform] = useState(defaultPlatform);
  const [results, setResults] = useState<SearchCandidate[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search() {
    const query = clubName.trim();
    if (query.length < 3) {
      setError("Enter at least three characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(false);
    onSelect(null);

    try {
      const response = await fetch(
        `/api/leagues/${leagueId}/ea/clubs/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clubName: query, platform }),
        },
      );
      const payload = (await response.json()) as {
        error?: string;
        results?: SearchCandidate[];
      };

      if (!response.ok) {
        throw new Error(payload.error || "EA club search failed.");
      }

      setResults(payload.results ?? []);
      setSearched(true);
    } catch (searchError) {
      setResults([]);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "EA club search failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ea-search">
      <div className="ea-search-controls">
        <label className="field">
          <span>EA club name</span>
          <input
            onChange={(event) => setClubName(event.target.value)}
            placeholder="Search the exact club name"
            value={clubName}
          />
        </label>
        <label className="field">
          <span>Platform</span>
          <select
            onChange={(event) => setPlatform(event.target.value)}
            value={platform}
          >
            <option value="common-gen5">Current generation</option>
            <option value="common-gen4">Previous generation</option>
          </select>
        </label>
        <button
          className="button button-secondary ea-search-button"
          disabled={loading}
          onClick={search}
          type="button"
        >
          {loading ? "Searching EA..." : "Search EA"}
        </button>
      </div>

      {error ? <p className="inline-error">{error}</p> : null}
      {searched && !results.length ? (
        <p className="inline-note">
          No matching clubs were returned. The team can still be saved and
          linked later.
        </p>
      ) : null}

      {results.length ? (
        <div className="ea-results" aria-label="EA club search results">
          {results.map((candidate) => {
            const isSelected =
              selected?.selectionToken === candidate.selectionToken;
            return (
              <button
                className={`ea-result${isSelected ? " ea-result-selected" : ""}`}
                key={`${candidate.platform}:${candidate.clubId}`}
                onClick={() => onSelect(isSelected ? null : candidate)}
                type="button"
              >
                <span>
                  <strong>{candidate.name}</strong>
                  <small>
                    ID {candidate.clubId} / {candidate.platform}
                  </small>
                </span>
                <span>
                  <strong>{record(candidate)}</strong>
                  <small>
                    {candidate.currentDivision === null
                      ? "Division unavailable"
                      : `Division ${candidate.currentDivision}`}
                  </small>
                </span>
                <span className="result-choice">
                  {isSelected ? "Selected" : "Select"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function TeamCreationForm({
  leagueId,
  defaultPlatform,
}: {
  leagueId: string;
  defaultPlatform: string;
}) {
  const [state, action, pending] = useActionState(createTeam, initialState);
  const [selected, setSelected] = useState<SearchCandidate | null>(null);

  return (
    <form action={action} className="team-create-form">
      <input name="leagueId" type="hidden" value={leagueId} />
      <input
        name="selectionToken"
        type="hidden"
        value={selected?.selectionToken ?? ""}
      />

      <div className="field-grid">
        <label className="field field-wide">
          <span>Team name</span>
          <input name="name" placeholder="Anarchy FC" required />
        </label>
        <label className="field">
          <span>Abbreviation</span>
          <input maxLength={8} minLength={2} name="abbreviation" placeholder="AFC" />
        </label>
        <label className="field">
          <span>Discord role ID</span>
          <input
            inputMode="numeric"
            name="discordRoleId"
            placeholder="Optional"
          />
        </label>
        <label className="field">
          <span>Primary colour</span>
          <input name="primaryColour" placeholder="#156EE8" />
        </label>
        <label className="field">
          <span>Secondary colour</span>
          <input name="secondaryColour" placeholder="#0C1118" />
        </label>
      </div>

      <EaClubSearch
        defaultPlatform={defaultPlatform}
        leagueId={leagueId}
        onSelect={setSelected}
        selected={selected}
      />

      <div className="team-form-footer">
        <p>
          {selected
            ? `${selected.name} will be linked when this team is created.`
            : "No EA club selected. You can safely link one later."}
        </p>
        <button className="button button-primary" disabled={pending} type="submit">
          {pending ? "Creating team..." : "Create team"}
        </button>
      </div>

      {state.error ? <p className="form-error">{state.error}</p> : null}
    </form>
  );
}

function TeamLinkEditor({
  leagueId,
  defaultPlatform,
  team,
}: {
  leagueId: string;
  defaultPlatform: string;
  team: TeamSummary;
}) {
  const [state, action, pending] = useActionState(
    linkTeamEaClub,
    initialState,
  );
  const [selected, setSelected] = useState<SearchCandidate | null>(null);

  return (
    <article className="team-card">
      <div className="team-card-heading">
        <div
          className="team-colour-swatch"
          style={{
            background: team.primary_colour ?? "var(--ink)",
            borderColor: team.secondary_colour ?? "var(--ink)",
          }}
        />
        <div>
          <p className="step-index">
            {team.abbreviation ?? "No abbreviation"}
          </p>
          <h3>{team.name}</h3>
        </div>
        <span
          className={`status-chip ${
            team.activeLink ? "" : "status-chip-warning"
          }`}
        >
          {team.activeLink ? "EA ready" : "Link required"}
        </span>
      </div>

      <dl className="team-meta">
        <div>
          <dt>Discord role</dt>
          <dd>{team.discord_role_id ?? "Not assigned"}</dd>
        </div>
        <div>
          <dt>EA club</dt>
          <dd>
            {team.activeLink
              ? `${team.activeLink.ea_club_name} / ${team.activeLink.ea_club_id}`
              : "Not linked"}
          </dd>
        </div>
      </dl>

      <form action={action} className="team-link-form">
        <input name="leagueId" type="hidden" value={leagueId} />
        <input name="teamId" type="hidden" value={team.id} />
        <input
          name="selectionToken"
          type="hidden"
          value={selected?.selectionToken ?? ""}
        />
        <EaClubSearch
          defaultPlatform={team.activeLink?.platform ?? defaultPlatform}
          leagueId={leagueId}
          onSelect={setSelected}
          selected={selected}
        />
        <div className="team-card-actions">
          <button
            className="button button-primary"
            disabled={!selected || pending}
            type="submit"
          >
            {pending
              ? "Saving link..."
              : team.activeLink
                ? "Replace EA link"
                : "Link EA club"}
          </button>
        </div>
        {state.error ? <p className="form-error">{state.error}</p> : null}
        {state.success ? <p className="form-success">{state.success}</p> : null}
      </form>

      {team.activeLink ? (
        <form
          action={unlinkTeamEaClub}
          className="unlink-form"
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Unlink ${team.activeLink?.ea_club_name} from ${team.name}? Historical links will be preserved.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input name="leagueId" type="hidden" value={leagueId} />
          <input name="teamId" type="hidden" value={team.id} />
          <input
            name="platform"
            type="hidden"
            value={team.activeLink.platform}
          />
          <button className="text-button danger-text" type="submit">
            Unlink current EA club
          </button>
        </form>
      ) : null}
    </article>
  );
}

export function TeamList({
  leagueId,
  defaultPlatform,
  teams,
}: {
  leagueId: string;
  defaultPlatform: string;
  teams: TeamSummary[];
}) {
  if (!teams.length) {
    return (
      <p className="empty-state">
        No teams yet. Create the first one above; an EA club link is optional
        until fixture collection is enabled.
      </p>
    );
  }

  return (
    <div className="team-list">
      {teams.map((team) => (
        <TeamLinkEditor
          defaultPlatform={defaultPlatform}
          key={team.id}
          leagueId={leagueId}
          team={team}
        />
      ))}
    </div>
  );
}

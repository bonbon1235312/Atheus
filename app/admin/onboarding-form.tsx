"use client";

import { useActionState, useState } from "react";

import {
  createLeague,
  type CreateLeagueState,
} from "@/app/admin/actions";
import type { ManagedDiscordGuild } from "@/lib/discord";

const initialState: CreateLeagueState = {};

export function OnboardingForm({
  guilds,
  inviteBaseUrl,
  premium,
}: {
  guilds: ManagedDiscordGuild[];
  inviteBaseUrl: string | null;
  premium: boolean;
}) {
  const [state, action, pending] = useActionState(createLeague, initialState);
  const [selectedGuildId, setSelectedGuildId] = useState(guilds[0]?.id ?? "");
  const selectedGuild = guilds.find((guild) => guild.id === selectedGuildId);

  return (
    <form action={action} className="onboarding-form">
      <div className="form-section">
        <div>
          <p className="step-index">01</p>
          <h2>League identity</h2>
        </div>
        <div className="field-grid">
          <label className="field field-wide">
            <span>League name</span>
            <input
              autoComplete="organization"
              maxLength={80}
              name="name"
              placeholder="Northstar Pro League"
              required
            />
          </label>
          <label className="field">
            <span>Short name</span>
            <input maxLength={16} name="shortName" placeholder="NPL" />
          </label>
          <label className="field">
            <span>Public address</span>
            <div className="subdomain-field">
              <input name="slug" placeholder="northstar-pro-league" />
              <span>.atheus.dev</span>
            </div>
          </label>
          <label className="field field-wide">
            <span>Description</span>
            <textarea
              maxLength={500}
              name="description"
              placeholder="A short public introduction to the league."
              rows={3}
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="step-index">02</p>
          <h2>Discord home</h2>
        </div>
        <div className="field-grid">
          <label className="field field-wide">
            <span>Server you manage</span>
            <select
              name="guildId"
              required
              value={selectedGuildId}
              onChange={(event) => setSelectedGuildId(event.target.value)}
            >
              {guilds.map((guild) => (
                <option key={guild.id} value={guild.id}>
                  {guild.name}
                  {guild.owner ? " / Owner" : " / Manager"}
                  {guild.botInstalled ? " / Atheus installed" : " / Bot required"}
                </option>
              ))}
            </select>
          </label>

          {selectedGuild && !selectedGuild.botInstalled && inviteBaseUrl ? (
            <a
              className="installation-note"
              href={`${inviteBaseUrl}&guild_id=${selectedGuild.id}&disable_guild_select=true`}
              rel="noreferrer"
              target="_blank"
            >
              Install Atheus in {selectedGuild.name}, then refresh this page.
            </a>
          ) : (
            <p className="installation-note installation-ready">
              {selectedGuild
                ? `Atheus is present in ${selectedGuild.name}. This server becomes the league's isolated Discord home.`
                : "No manageable Discord servers were returned."}
            </p>
          )}
          <p className="field-help field-wide">
            Atheus resolves league data from this server&apos;s Discord ID. It
            will never fall back to another league, and one Discord server
            cannot actively host two leagues.
          </p>
          {!premium && selectedGuild && !selectedGuild.owner ? (
            <p className="installation-note">
              Free leagues require the signed-in Discord account to own the
              selected server. Manage Server permission alone is not enough.
            </p>
          ) : null}
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="step-index">03</p>
          <h2>Match operations</h2>
        </div>
        <div className="field-grid">
          <label className="field">
            <span>Timezone</span>
            <select defaultValue="Europe/London" name="timezone">
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Dublin">Europe/Dublin</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Chicago">America/Chicago</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
            </select>
          </label>
          <label className="field">
            <span>EA platform</span>
            <select defaultValue="common-gen5" name="platform">
              <option value="common-gen5">New generation</option>
              <option value="common-gen4">Old generation</option>
            </select>
          </label>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="step-index">04</p>
          <h2>Site administration</h2>
        </div>
        <div className="field-grid">
          <label className="field field-wide">
            <span>Administrator username</span>
            <input
              autoComplete="username"
              maxLength={32}
              minLength={3}
              name="siteUsername"
              pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}"
              placeholder="league.admin"
              required
            />
          </label>
          <label className="field">
            <span>Administrator password</span>
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
            <span>Confirm password</span>
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
            This shared login opens only this league&apos;s website workspace as
            an administrator. Discord remains required for ownership, billing,
            activation and staff access.
          </p>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="step-index">05</p>
          <h2>Colour system</h2>
        </div>
        <div className="colour-grid">
          <label className="colour-field">
            <span>Primary</span>
            <input defaultValue="#156EE8" name="primaryColour" type="color" />
          </label>
          <label className="colour-field">
            <span>Secondary</span>
            <input defaultValue="#0C1118" name="secondaryColour" type="color" />
          </label>
          <label className="colour-field">
            <span>Accent</span>
            <input defaultValue="#21C7A8" name="accentColour" type="color" />
          </label>
        </div>
      </div>

      {state.error ? <p className="form-error">{state.error}</p> : null}

      <button
        className="button button-primary submit-button"
        disabled={
          pending ||
          !selectedGuild?.botInstalled ||
          (!premium && !selectedGuild.owner)
        }
        type="submit"
      >
        {pending ? "Creating league..." : "Create league workspace"}
      </button>
    </form>
  );
}

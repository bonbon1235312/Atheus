"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  createLeague,
  type CreateLeagueState,
} from "@/app/admin/actions";
import type { ManagedDiscordGuild } from "@/lib/discord";

const initialState: CreateLeagueState = {};

const STEPS = [
  { label: "Identity", title: "01" },
  { label: "Discord", title: "02" },
  { label: "Match ops", title: "03" },
  { label: "Site admin", title: "04" },
  { label: "Colours", title: "05" },
];

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
  const [currentStep, setCurrentStep] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setCurrentStep(i);
        },
        { threshold: 0.2, rootMargin: "-80px 0px -30% 0px" },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  return (
    <form action={action} className="onboarding-form">
      <nav className="onboarding-progress" aria-label="Setup progress">
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            className={`onboarding-progress-step${i <= currentStep ? " is-reached" : ""}`}
          >
            <div className="onboarding-progress-track" />
            <span className="onboarding-progress-label">{step.label}</span>
          </div>
        ))}
      </nav>

      {/* Step 1 — League identity */}
      <div
        className="form-section"
        ref={(el) => { sectionRefs.current[0] = el; }}
      >
        <div className="form-section-head">
          <p className="step-index">01</p>
          <h2>League identity</h2>
          <p className="form-section-desc">
            Your league name, short code, and public web address. The address
            becomes <span className="form-code">yourleague.atheus.dev</span> —
            it can be changed later from the workspace.
          </p>
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

      {/* Step 2 — Discord home */}
      <div
        className="form-section"
        ref={(el) => { sectionRefs.current[1] = el; }}
      >
        <div className="form-section-head">
          <p className="step-index">02</p>
          <h2>Discord home</h2>
          <p className="form-section-desc">
            Atheus ties every fixture, result and player record to one Discord
            server. Data never crosses between leagues, and one server can only
            host one league at a time.
          </p>
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
            <div className="onboarding-callout onboarding-callout-action">
              <p>
                <strong>Atheus needs to be in {selectedGuild.name} first.</strong>{" "}
                Install it to unlock this server, then come back and refresh this page.
              </p>
              <a
                href={`${inviteBaseUrl}&guild_id=${selectedGuild.id}&disable_guild_select=true`}
                rel="noreferrer"
                target="_blank"
                className="button button-secondary"
              >
                Install Atheus in {selectedGuild.name}
              </a>
            </div>
          ) : (
            <p className="installation-note installation-ready">
              {selectedGuild
                ? `Atheus is present in ${selectedGuild.name}. This server becomes the league's isolated Discord home.`
                : "No manageable Discord servers were returned."}
            </p>
          )}

          {!premium && selectedGuild && !selectedGuild.owner ? (
            <div className="onboarding-callout">
              <p>
                Free leagues require your Discord account to <strong>own</strong> the
                selected server. Manage Server permission alone is not enough.
                Select a server you own, or upgrade to Premium.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Step 3 — Match operations */}
      <div
        className="form-section"
        ref={(el) => { sectionRefs.current[2] = el; }}
      >
        <div className="form-section-head">
          <p className="step-index">03</p>
          <h2>Match operations</h2>
          <p className="form-section-desc">
            Atheus collects real match data from EA. The timezone tells it when
            to scan for results after each matchday window closes. The platform
            sets which EA server pool to search.
          </p>
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
              <option value="common-gen5">New generation (PS5, Xbox Series)</option>
              <option value="common-gen4">Old generation (PS4, Xbox One)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Step 4 — Site administration */}
      <div
        className="form-section"
        ref={(el) => { sectionRefs.current[3] = el; }}
      >
        <div className="form-section-head">
          <p className="step-index">04</p>
          <h2>Site administration</h2>
          <p className="form-section-desc">
            A separate login for your league&apos;s website workspace. Use it to
            sign in directly at your league site without going through Discord.
            Share it with co-admins, or keep it as a backup. Discord remains
            required for ownership and billing.
          </p>
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
            Minimum 12 characters. This password is for the league site only
            and is stored separately from your Atheus account.
          </p>
        </div>
      </div>

      {/* Step 5 — Colour system */}
      <div
        className="form-section"
        ref={(el) => { sectionRefs.current[4] = el; }}
      >
        <div className="form-section-head">
          <p className="step-index">05</p>
          <h2>Colour system</h2>
          <p className="form-section-desc">
            These colours power your public league site. Primary is used for
            highlights, ranked rows and badges. Secondary sets the background
            and surface tones. Accent picks up secondary data points. All three
            can be updated any time from the workspace.
          </p>
        </div>
        <div className="colour-grid">
          <label className="colour-field">
            <input defaultValue="#156EE8" name="primaryColour" type="color" />
            <span>Primary</span>
          </label>
          <label className="colour-field">
            <input defaultValue="#0C1118" name="secondaryColour" type="color" />
            <span>Secondary</span>
          </label>
          <label className="colour-field">
            <input defaultValue="#21C7A8" name="accentColour" type="color" />
            <span>Accent</span>
          </label>
        </div>
      </div>

      {state.error ? <p className="form-error">{state.error}</p> : null}

      <div className="onboarding-submit-row">
        <button
          className="button button-primary submit-button"
          disabled={
            pending ||
            !selectedGuild?.botInstalled ||
            (!premium && !selectedGuild?.owner)
          }
          type="submit"
        >
          {pending ? "Creating league..." : "Create league workspace"}
        </button>
        <p className="onboarding-submit-note">
          Your league site goes live immediately after creation.
        </p>
      </div>
    </form>
  );
}

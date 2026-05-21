"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="grid gap-0"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <label className="studio-field">
        <span className="studio-field-label">Your name</span>
        <input
          required
          name="name"
          className="studio-field-input"
          placeholder="e.g. Eleanor Carr"
          autoComplete="name"
        />
      </label>

      <label className="studio-field">
        <span className="studio-field-label">Business</span>
        <input
          name="business"
          className="studio-field-input"
          placeholder="Cinder &amp; Clover"
          autoComplete="organization"
        />
      </label>

      <label className="studio-field">
        <span className="studio-field-label">Email</span>
        <input
          required
          type="email"
          name="email"
          className="studio-field-input"
          placeholder="you@somewhere.co.uk"
          autoComplete="email"
        />
      </label>

      <label className="studio-field">
        <span className="studio-field-label">Project type</span>
        <select className="studio-field-select" name="projectType" defaultValue="">
          <option value="" disabled>
            — Choose one —
          </option>
          <option>New website</option>
          <option>Website redesign</option>
          <option>Landing page or campaign</option>
          <option>Ongoing support</option>
          <option>Something else</option>
        </select>
      </label>

      <label className="studio-field">
        <span className="studio-field-label">Budget range</span>
        <select className="studio-field-select" name="budget" defaultValue="">
          <option value="" disabled>
            — Choose one —
          </option>
          <option>Launch project (under £2k)</option>
          <option>Studio website (£2 – 5k)</option>
          <option>Campaign or landing page (£500 – 1.5k)</option>
          <option>Managed support / retainer</option>
        </select>
      </label>

      <label className="studio-field" style={{ borderBottom: "1px solid var(--line-dark)" }}>
        <span className="studio-field-label">Message</span>
        <textarea
          required
          rows={4}
          name="message"
          className="studio-field-area"
          placeholder="The business, the problem, and what the site needs to do."
        />
      </label>

      <button type="submit" className="studio-button studio-button-primary mt-8 justify-self-start">
        Send enquiry
      </button>

      <p className="mt-5 text-sm text-chalk/55">
        Or email directly at{" "}
        <a className="font-bold text-chalk hover:text-acid" href="mailto:hello@atheus.dev">
          hello@atheus.dev
        </a>
        . First reply within one working day.
      </p>

      {submitted ? (
        <p className="mt-5 border border-acid/40 bg-acid/10 p-4 text-sm font-semibold text-acid">
          Enquiry captured. While the form is in MVP mode, please also send the same details to hello@atheus.dev so we can pick it up.
        </p>
      ) : null}
    </form>
  );
}

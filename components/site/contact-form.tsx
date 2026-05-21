"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      business: formData.get("business"),
      email: formData.get("email"),
      projectType: formData.get("projectType"),
      budget: formData.get("budget"),
      message: formData.get("message"),
    };

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        const message =
          data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not send your enquiry. Please email hello@atheus.dev directly.";
        throw new Error(message);
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not send your enquiry. Please email hello@atheus.dev directly.",
      );
    }
  }

  const submitting = status === "submitting";

  return (
    <form className="grid gap-0" onSubmit={handleSubmit} noValidate>
      <label className="studio-field">
        <span className="studio-field-label">Your name</span>
        <input
          required
          name="name"
          className="studio-field-input"
          placeholder="e.g. Eleanor Carr"
          autoComplete="name"
          disabled={submitting}
        />
      </label>

      <label className="studio-field">
        <span className="studio-field-label">Business</span>
        <input
          name="business"
          className="studio-field-input"
          placeholder="Cinder &amp; Clover"
          autoComplete="organization"
          disabled={submitting}
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
          disabled={submitting}
        />
      </label>

      <label className="studio-field">
        <span className="studio-field-label">Project type</span>
        <select
          className="studio-field-select"
          name="projectType"
          defaultValue=""
          disabled={submitting}
        >
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
        <select
          className="studio-field-select"
          name="budget"
          defaultValue=""
          disabled={submitting}
        >
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
          disabled={submitting}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="studio-button studio-button-primary mt-8 justify-self-start disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send enquiry"}
      </button>

      <p className="mt-5 text-sm text-chalk/55">
        Or email directly at{" "}
        <a className="font-bold text-chalk hover:text-acid" href="mailto:hello@atheus.dev">
          hello@atheus.dev
        </a>
        . First reply within one working day.
      </p>

      {status === "success" ? (
        <p
          className="mt-5 border border-acid/40 bg-acid/10 p-4 text-sm font-semibold text-acid"
          role="status"
          aria-live="polite"
        >
          Thanks — enquiry received. I&apos;ll reply within one working day.
        </p>
      ) : null}

      {status === "error" ? (
        <p
          className="mt-5 border border-flare/40 bg-flare/10 p-4 text-sm font-semibold text-flare"
          role="alert"
          aria-live="assertive"
        >
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}

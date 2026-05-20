"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="studio-card grid gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-chalk/68">Name</span>
          <input required className="rounded-md border-white/10 bg-chalk px-4 py-3 text-ink" name="name" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-chalk/68">Business</span>
          <input className="rounded-md border-white/10 bg-chalk px-4 py-3 text-ink" name="business" />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-bold text-chalk/68">Email</span>
        <input required type="email" className="rounded-md border-white/10 bg-chalk px-4 py-3 text-ink" name="email" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-chalk/68">Project type</span>
          <select className="rounded-md border-white/10 bg-chalk px-4 py-3 text-ink" name="projectType" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            <option>New website</option>
            <option>Website redesign</option>
            <option>Landing page</option>
            <option>Ongoing support</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-chalk/68">Budget range</span>
          <select className="rounded-md border-white/10 bg-chalk px-4 py-3 text-ink" name="budget" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            <option>Launch project</option>
            <option>Studio website</option>
            <option>Campaign or landing page</option>
            <option>Managed support</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-bold text-chalk/68">Message</span>
        <textarea required rows={6} className="rounded-md border-white/10 bg-chalk px-4 py-3 text-ink" name="message" />
      </label>

      <button type="submit" className="studio-button studio-button-primary justify-self-start">
        Send enquiry
      </button>

      <p className="text-sm text-chalk/58">
        You can also email directly at{" "}
        <a className="font-bold text-chalk" href="mailto:hello@atheus.dev">
          hello@atheus.dev
        </a>
        .
      </p>

      {submitted ? (
        <p className="border border-acid/40 bg-acid/10 p-3 text-sm font-semibold text-acid">
          Enquiry captured in the interface. For the MVP, please send the same
          details to hello@atheus.dev.
        </p>
      ) : null}
    </form>
  );
}

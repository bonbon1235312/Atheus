"use client";

import { FormEvent, useMemo, useState } from "react";

const workTypes = [
  { id: "commercial", label: "Commercial fit-out" },
  { id: "ev", label: "EV charging" },
  { id: "domestic", label: "Domestic wiring" },
  { id: "emergency", label: "Emergency call-out" },
] as const;

const properties = [
  { id: "office", label: "Office" },
  { id: "warehouse", label: "Warehouse" },
  { id: "retail", label: "Retail" },
  { id: "house", label: "House" },
  { id: "flat", label: "Flat" },
] as const;

const timelines = [
  { id: "week", label: "This week" },
  { id: "month", label: "2-4 weeks" },
  { id: "quarter", label: "1-3 months" },
  { id: "pricing", label: "Pricing only" },
] as const;

const stages = ["work", "property", "timing", "details"] as const;

type Stage = (typeof stages)[number];
type WorkId = (typeof workTypes)[number]["id"];
type PropertyId = (typeof properties)[number]["id"];
type TimelineId = (typeof timelines)[number]["id"];

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function QuoteForm() {
  const [stage, setStage] = useState<Stage>("work");
  const [work, setWork] = useState<WorkId | null>(null);
  const [property, setProperty] = useState<PropertyId | null>(null);
  const [timeline, setTimeline] = useState<TimelineId | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>(
    {},
  );
  const [done, setDone] = useState(false);

  const workLabel = workTypes.find((item) => item.id === work)?.label ?? "";
  const propertyLabel = properties.find((item) => item.id === property)?.label ?? "";
  const timelineLabel = timelines.find((item) => item.id === timeline)?.label ?? "";

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`Quote request: ${workLabel}`);
    const body = encodeURIComponent(
      [
        `Work: ${workLabel}`,
        `Property: ${propertyLabel}`,
        `Timing: ${timelineLabel}`,
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone.trim()}`,
      ].join("\n"),
    );
    return `mailto:quotes@northline-electrical.example?subject=${subject}&body=${body}`;
  }, [workLabel, propertyLabel, timelineLabel, name, email, phone]);

  function goNext() {
    if (stage === "work" && work) setStage("property");
    if (stage === "property" && property) setStage("timing");
    if (stage === "timing" && timeline) setStage("details");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!isEmail(email.trim())) nextErrors.email = "Enter a valid email.";
    if (phone.trim().replace(/\s/g, "").length < 10) {
      nextErrors.phone = "Enter a phone number we can call.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setDone(true);
  }

  if (done) {
    return (
      <div className="nl-quote-done" role="status">
        <h3>Request received</h3>
        <p>
          {name.trim()}, we have your {workLabel.toLowerCase()} enquiry for a{" "}
          {propertyLabel.toLowerCase()}. Timing: {timelineLabel.toLowerCase()}.
        </p>
        <p>We will reply to {email.trim()} within one working day.</p>
        <a className="nl-btn" href={mailto}>
          Open in your email app
        </a>
        <button
          className="nl-btn nl-btn-ghost"
          type="button"
          onClick={() => {
            setDone(false);
            setStage("work");
            setWork(null);
            setProperty(null);
            setTimeline(null);
            setName("");
            setEmail("");
            setPhone("");
            setErrors({});
          }}
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form className="nl-quote" onSubmit={onSubmit} noValidate>
      <ol className="nl-quote-progress">
        {stages.map((item) => (
          <li key={item} className={stage === item ? "is-current" : undefined}>
            {item === "work" && "Work type"}
            {item === "property" && "Property"}
            {item === "timing" && "Timing"}
            {item === "details" && "Your details"}
          </li>
        ))}
      </ol>

      {stage === "work" ? (
        <fieldset>
          <legend>What do you need?</legend>
          <div className="nl-choice-grid">
            {workTypes.map((item) => (
              <label key={item.id} className={work === item.id ? "is-selected" : undefined}>
                <input
                  type="radio"
                  name="work"
                  value={item.id}
                  checked={work === item.id}
                  onChange={() => setWork(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {stage === "property" ? (
        <fieldset>
          <legend>What is the property?</legend>
          <div className="nl-choice-grid">
            {properties.map((item) => (
              <label
                key={item.id}
                className={property === item.id ? "is-selected" : undefined}
              >
                <input
                  type="radio"
                  name="property"
                  value={item.id}
                  checked={property === item.id}
                  onChange={() => setProperty(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {stage === "timing" ? (
        <fieldset>
          <legend>When do you need it?</legend>
          <div className="nl-choice-grid nl-choice-grid-2">
            {timelines.map((item) => (
              <label
                key={item.id}
                className={timeline === item.id ? "is-selected" : undefined}
              >
                <input
                  type="radio"
                  name="timeline"
                  value={item.id}
                  checked={timeline === item.id}
                  onChange={() => setTimeline(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {stage === "details" ? (
        <fieldset className="nl-quote-fields">
          <legend>How do we reach you?</legend>
          <div className="nl-field">
            <label htmlFor="nl-name">Name</label>
            <input
              id="nl-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name ? <p className="nl-error">{errors.name}</p> : null}
          </div>
          <div className="nl-field">
            <label htmlFor="nl-email">Email</label>
            <input
              id="nl-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email ? <p className="nl-error">{errors.email}</p> : null}
          </div>
          <div className="nl-field">
            <label htmlFor="nl-phone">Phone</label>
            <input
              id="nl-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            {errors.phone ? <p className="nl-error">{errors.phone}</p> : null}
          </div>
        </fieldset>
      ) : null}

      <div className="nl-quote-actions">
        {stage !== "work" ? (
          <button
            className="nl-btn nl-btn-ghost"
            type="button"
            onClick={() => {
              const index = stages.indexOf(stage);
              setStage(stages[Math.max(0, index - 1)]!);
            }}
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {stage === "details" ? (
          <button className="nl-btn" type="submit">
            Send request
          </button>
        ) : (
          <button
            className="nl-btn"
            type="button"
            disabled={
              (stage === "work" && !work) ||
              (stage === "property" && !property) ||
              (stage === "timing" && !timeline)
            }
            onClick={goNext}
          >
            Continue
          </button>
        )}
      </div>
    </form>
  );
}

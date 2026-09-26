"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

export function ProjectBrief({ directDelivery = false }: { directDelivery?: boolean }) {
  const [brief, setBrief] = useState("");
  const [copied, setCopied] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const submissionId = useRef<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function prepareBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const values = new FormData(event.currentTarget);
    const text = (key: string) => String(values.get(key) ?? "").trim();
    setBrief(["New project enquiry", "", `Name: ${text("name")}`, `Email: ${text("email")}`, `Business: ${text("business") || "Not specified"}`, `Current website: ${text("website") || "Not specified"}`, `Looking for: ${text("type")}`, `Budget: ${text("budget")}`, `Timing: ${text("timing")}`, "", text("project")].join("\n"));
    setCopied("");
    setError("");
    if (directDelivery) {
      setSending(true);
      submissionId.current ??= crypto.randomUUID();
      try {
        const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(values), submissionId: submissionId.current }), signal: AbortSignal.timeout(15000) });
        const result = await response.json();
        if (!response.ok || !result.accepted) setError(result.error || "Your brief couldn’t be sent. Please try the email option below.");
        else setSent(true);
      } catch { setError("Delivery could not be confirmed. Retry the same brief or use the email option below."); }
      finally { setSending(false); }
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  async function copyBrief() {
    try { await navigator.clipboard.writeText(brief); setCopied("Copied. Paste this into an email to hello@atheus.dev."); }
    catch { setCopied("Select and copy the brief below, then paste it into your email."); }
  }

  return <div className="studio-brief">
    <form onSubmit={prepareBrief} onChange={() => { if (brief) setBrief(""); submissionId.current = null; setSent(false); setError(""); }} aria-busy={sending}>
      <div className="studio-form-trap" aria-hidden="true"><label>Leave this blank<input name="companyFax" tabIndex={-1} autoComplete="off" /></label></div>
      <fieldset className="studio-form-grid" disabled={sending}>
        <legend className="studio-visually-hidden">Project details</legend>
        <label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label>Business / organisation <span>Optional</span><input name="business" autoComplete="organization" maxLength={120} /></label>
        <label>Current website <span>Optional</span><input name="website" type="text" inputMode="url" autoComplete="url" maxLength={300} placeholder="yourwebsite.com" /></label>
        <label className="studio-form-wide">What are you looking for?<select name="type" defaultValue="" required><option value="" disabled>Select a starting point</option><option>New website</option><option>Website redesign</option><option>Custom software</option><option>Not sure yet</option></select></label>
        <label className="studio-form-wide">Tell me about the project<textarea name="project" required minLength={10} maxLength={1800} rows={6} placeholder="What do you want to make, and who is it for?" /></label>
        <label>Approximate budget<select name="budget" defaultValue="Not sure yet"><option>Under £1,000</option><option>£1,000–£2,500</option><option>£2,500–£5,000</option><option>£5,000–£10,000</option><option>£10,000+</option><option>Not sure yet</option></select></label>
        <label>Timing<select name="timing" defaultValue="Just exploring"><option>As soon as practical</option><option>1–2 months</option><option>3–6 months</option><option>Just exploring</option></select></label>
      </fieldset>
      <p className="studio-source">{directDelivery ? "Your details are used to respond to this enquiry and discuss your project." : "This form prepares an email brief. Your details stay in this page until you choose to send them using your email app."} <Link href="/privacy">Privacy information</Link>.</p>
      <button className="agency-btn" type="submit" disabled={sending || sent}>{sending ? "Sending your brief…" : sent ? "Brief sent" : directDelivery ? "Send project brief" : "Prepare my project brief"} <span aria-hidden="true">→</span></button>
    </form>
    {brief && !sending && <div className="studio-brief-result" ref={resultRef} tabIndex={-1}>
      {sent ? <><h2>Thanks. Your brief is on its way.</h2><p>The email service has accepted your enquiry. I’ll read it personally and reply with the next step.</p></> : <>
      {error && <p role="alert">{error}</p>}
      <h2>Your brief is ready.</h2><p>{directDelivery ? "You can send a copy directly using your email app, or copy the brief into an email to " : "Nothing has been sent yet. Open your email app to review and send it, or copy the brief into an email to "}<a href="mailto:hello@atheus.dev">hello@atheus.dev</a>.</p>
      <div className="studio-brief-actions"><a className="agency-btn" href={`mailto:hello@atheus.dev?subject=${encodeURIComponent("New project enquiry")}&body=${encodeURIComponent(brief)}`}>Open email app ↗</a><button type="button" className="agency-arrow-link" onClick={copyBrief}>Copy brief</button></div>
      <p role="status">{copied}</p><details><summary>Review the email text</summary><pre>{brief}</pre></details>
      </>}
    </div>}
  </div>;
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";

// A per-instance burst guard. Fixed recipient and bounded input also keep this
// endpoint from becoming a general-purpose email relay.
const requests = new Map<string, { count: number; reset: number }>();
const windowMs = 15 * 60 * 1000;
const types = new Set(["New website", "Website redesign", "Custom software", "Not sure yet"]);
const budgets = new Set(["Under £1,000", "£1,000–£2,500", "£2,500–£5,000", "£5,000–£10,000", "£10,000+", "Not sure yet"]);
const timings = new Set(["As soon as practical", "1–2 months", "3–6 months", "Just exploring"]);

export async function POST(request: Request) {
  const respond = (error: string, status: number) => NextResponse.json({ error }, { status });
  if (request.headers.get("origin") !== new URL(request.url).origin) return respond("Please submit from the Atheus contact page.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return respond("Unsupported request format.", 415);
  if (!process.env.RESEND_API_KEY) return respond("Direct delivery is unavailable. Please use the email option below.", 503);
  if (Number(request.headers.get("content-length")) > 12000) return respond("Please shorten your project description.", 413);

  let data: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return respond("Please shorten your project description.", 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return respond("Please check your enquiry details.", 400);
    data = parsed as Record<string, unknown>;
  } catch { return respond("Please check your enquiry details.", 400); }

  const limits = { name: 100, email: 254, business: 120, website: 300, type: 40, project: 1800, budget: 40, timing: 40, submissionId: 36 };
  for (const [field, limit] of Object.entries(limits)) {
    if (typeof data[field] !== "string" || data[field].length > limit) return respond("Please check your enquiry details.", 400);
  }
  const value = (key: string) => (data[key] as string).trim();
  if (data.companyFax || !value("name") || value("project").length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email")) || /[\r\n]/.test(value("name")) || !types.has(value("type")) || !budgets.has(value("budget")) || !timings.has(value("timing")) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value("submissionId"))) return respond("Please check your enquiry details.", 400);

  const now = Date.now();
  for (const [key, entry] of requests) if (entry.reset < now) requests.delete(key);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const entry = requests.get(ip) ?? { count: 0, reset: now + windowMs };
  if (entry.count >= 5 || (!requests.has(ip) && requests.size >= 2000)) return respond("Please wait a little before trying again, or email hello@atheus.dev directly.", 429);
  requests.set(ip, { count: entry.count + 1, reset: entry.reset });

  const text = [`Name: ${value("name")}`, `Email: ${value("email")}`, `Business: ${value("business") || "Not specified"}`, `Website: ${value("website") || "Not specified"}`, `Project type: ${value("type")}`, `Budget: ${value("budget")}`, `Timing: ${value("timing")}`, "", value("project")].join("\n");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `atheus-contact-${value("submissionId")}` },
      body: JSON.stringify({ from: process.env.CONTACT_FROM_EMAIL || "Atheus <hello@atheus.dev>", to: ["hello@atheus.dev"], reply_to: value("email"), subject: `Project enquiry: ${value("type")}`, text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return respond("The email service couldn’t accept your brief. Please try again or use the email option below.", 502);
    const result = await response.json();
    if (!result.id) return respond("Delivery could not be confirmed. Please use the email option below.", 502);
    return NextResponse.json({ accepted: true });
  } catch { return respond("Delivery could not be confirmed. You can retry or use the email option below.", 502); }
}

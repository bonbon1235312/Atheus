import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type ContactPayload = {
  name?: unknown;
  business?: unknown;
  email?: unknown;
  projectType?: unknown;
  budget?: unknown;
  message?: unknown;
};

function asString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fieldRow(label: string, value: string | undefined): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e5e1d7;color:#6b675d;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e1d7;color:#171512;font-size:15px;line-height:1.5;">${escapeHtml(value).replace(/\n/g, "<br/>")}</td>
    </tr>
  `;
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email service is not configured yet. Please email hello@atheus.dev directly." },
      { status: 503 },
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = asString(payload.name, 120);
  const business = asString(payload.business, 160);
  const email = asString(payload.email, 200);
  const projectType = asString(payload.projectType, 120);
  const budget = asString(payload.budget, 120);
  const message = asString(payload.message, 4000);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.CONTACT_FROM_EMAIL ?? "Atheus <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO_EMAIL ?? "hello@atheus.dev";

  const subject = business
    ? `New enquiry · ${name} (${business})`
    : `New enquiry · ${name}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en"><body style="margin:0;padding:32px;background:#f5efe3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#171512;">
      <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e1d7;">
        <tr>
          <td style="padding:24px 28px;background:#050505;color:#f4efe6;">
            <p style="margin:0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#d7ff35;">New enquiry · Atheus</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:700;letter-spacing:-0.01em;">${escapeHtml(name)}${business ? ` <span style="color:rgba(244,239,230,0.6);font-weight:400">· ${escapeHtml(business)}</span>` : ""}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px;">
            <table cellpadding="0" cellspacing="0" style="width:100%;">
              ${fieldRow("Email", email)}
              ${fieldRow("Business", business)}
              ${fieldRow("Project type", projectType)}
              ${fieldRow("Budget", budget)}
              ${fieldRow("Message", message)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 28px;border-top:1px solid #e5e1d7;color:#8a857c;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">
            Sent from atheus.dev · reply-to set to sender
          </td>
        </tr>
      </table>
    </body></html>
  `;

  const text = [
    `New enquiry — Atheus`,
    ``,
    `Name: ${name}`,
    business ? `Business: ${business}` : null,
    `Email: ${email}`,
    projectType ? `Project type: ${projectType}` : null,
    budget ? `Budget: ${budget}` : null,
    ``,
    `Message:`,
    message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error("Resend send error:", result.error);
      return NextResponse.json(
        { error: "Could not send your enquiry. Please email hello@atheus.dev directly." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unexpected send error:", error);
    return NextResponse.json(
      { error: "Could not send your enquiry. Please email hello@atheus.dev directly." },
      { status: 500 },
    );
  }
}

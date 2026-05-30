import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { fetchUserGuilds, canManage } from "@/lib/discord";

export const runtime = "nodejs";

// GET /api/billing/checkout?guild=<id>        -> per-server Pro
// GET /api/billing/checkout?scope=account     -> all-access (every owned server)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.redirect(new URL("/dashboard", req.url));

  const url = new URL(req.url);
  const base = process.env.AUTH_URL ?? url.origin;
  const scope = url.searchParams.get("scope") === "account" ? "account" : "guild";

  // --- All-access (per account) ---
  if (scope === "account") {
    const userId = session.discordId;
    if (!userId) return NextResponse.redirect(new URL("/dashboard", req.url));
    const priceId = process.env.STRIPE_ACCOUNT_PRICE_ID;
    if (!priceId) return NextResponse.json({ error: "STRIPE_ACCOUNT_PRICE_ID not set." }, { status: 500 });

    const checkout = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { scope: "account", userId },
      subscription_data: { metadata: { scope: "account", userId } },
      allow_promotion_codes: true,
      payment_method_collection: "if_required",
      success_url: `${base}/dashboard?upgraded=all`,
      cancel_url: `${base}/dashboard`,
    });
    return NextResponse.redirect(checkout.url as string, { status: 303 });
  }

  // --- Per-server ---
  const guildId = url.searchParams.get("guild");
  if (!guildId) return NextResponse.json({ error: "Missing guild." }, { status: 400 });

  const manages = (await fetchUserGuilds(session.accessToken)).some(
    (g) => g.id === guildId && canManage(g)
  );
  if (!manages) return NextResponse.redirect(new URL("/dashboard", req.url));

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "STRIPE_PRICE_ID not set." }, { status: 500 });

  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { scope: "guild", guildId },
    subscription_data: { metadata: { scope: "guild", guildId } },
    allow_promotion_codes: true,
    payment_method_collection: "if_required",
    success_url: `${base}/dashboard/${guildId}?upgraded=1`,
    cancel_url: `${base}/dashboard/${guildId}`,
  });
  return NextResponse.redirect(checkout.url as string, { status: 303 });
}

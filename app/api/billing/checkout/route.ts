import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { fetchUserGuilds, canManage } from "@/lib/discord";

export const runtime = "nodejs";

// GET /api/billing/checkout?guild=<id> -> redirect to Stripe Checkout for Pro.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.redirect(new URL("/dashboard", req.url));

  const guildId = new URL(req.url).searchParams.get("guild");
  if (!guildId) return NextResponse.json({ error: "Missing guild." }, { status: 400 });

  // Only let someone upgrade a server they actually manage.
  const manages = (await fetchUserGuilds(session.accessToken)).some(
    (g) => g.id === guildId && canManage(g)
  );
  if (!manages) return NextResponse.redirect(new URL("/dashboard", req.url));

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "STRIPE_PRICE_ID not set." }, { status: 500 });

  const base = process.env.AUTH_URL ?? new URL(req.url).origin;
  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { guildId },
    subscription_data: { metadata: { guildId } },
    success_url: `${base}/dashboard/${guildId}?upgraded=1`,
    cancel_url: `${base}/dashboard/${guildId}`,
  });

  return NextResponse.redirect(checkout.url as string, { status: 303 });
}

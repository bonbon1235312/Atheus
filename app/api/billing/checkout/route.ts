import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { fetchUserGuilds, canManage } from "@/lib/discord";

export const runtime = "nodejs";

function msg(text: string, status: number) {
  return new Response(text, { status, headers: { "content-type": "text/plain" } });
}

// GET /api/billing/checkout?guild=<id>        -> per-server Pro
// GET /api/billing/checkout?scope=account     -> all-access (every owned server)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.redirect(new URL("/dashboard", req.url));

  const url = new URL(req.url);
  const base = process.env.AUTH_URL ?? url.origin;
  const scope = url.searchParams.get("scope") === "account" ? "account" : "guild";

  try {
    // --- All-access (per account) ---
    if (scope === "account") {
      const userId = session.discordId;
      if (!userId) {
        return msg(
          "We need your Discord ID for All-Access, and it's missing from your session. Please sign out and sign back in, then try again.",
          400
        );
      }
      const priceId = process.env.STRIPE_ACCOUNT_PRICE_ID;
      if (!priceId) return msg("STRIPE_ACCOUNT_PRICE_ID is not set in the environment.", 500);

      const checkout = await stripe().checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { scope: "account", userId },
        subscription_data: { metadata: { scope: "account", userId } },
        allow_promotion_codes: true,
        payment_method_collection: "if_required",
        success_url: `${base}/dashboard?upgraded=all`,
        cancel_url: `${base}/dashboard/upgrade`,
      });
      return NextResponse.redirect(checkout.url as string, { status: 303 });
    }

    // --- Per-server ---
    const guildId = url.searchParams.get("guild");
    if (!guildId) return msg("Missing guild.", 400);

    const manages = (await fetchUserGuilds(session.accessToken)).some(
      (g) => g.id === guildId && canManage(g)
    );
    if (!manages) return NextResponse.redirect(new URL("/dashboard/upgrade", req.url));

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) return msg("STRIPE_PRICE_ID is not set in the environment.", 500);

    const checkout = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { scope: "guild", guildId },
      subscription_data: { metadata: { scope: "guild", guildId } },
      allow_promotion_codes: true,
      payment_method_collection: "if_required",
      success_url: `${base}/dashboard/${guildId}?upgraded=1`,
      cancel_url: `${base}/dashboard/upgrade`,
    });
    return NextResponse.redirect(checkout.url as string, { status: 303 });
  } catch (e) {
    console.error("[checkout]", e);
    return msg(`Checkout could not start: ${(e as Error).message}`, 500);
  }
}

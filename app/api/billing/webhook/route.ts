import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { upsertPremium } from "@/lib/premium-db";

export const runtime = "nodejs";

// current_period_end lives at the top level on older Stripe API versions and on
// subscription items on newer ones. Read it defensively either way.
function periodEnd(sub: Stripe.Subscription): string | null {
  const s = sub as unknown as {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  const ts = s.current_period_end ?? s.items?.data?.[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

// Stripe webhook: keeps the `premium` table in sync with subscriptions.
// Add the endpoint URL https://atheus.dev/api/billing/webhook in Stripe.
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new Response("Missing signature.", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return new Response(`Webhook error: ${(e as Error).message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const guildId = s.metadata?.guildId;
      if (guildId && s.subscription) {
        const sub = await stripe().subscriptions.retrieve(s.subscription as string);
        await upsertPremium({
          guildId,
          customerId: (s.customer as string) ?? null,
          subscriptionId: sub.id,
          status: sub.status,
          currentPeriodEnd: periodEnd(sub),
        });
      }
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const guildId = sub.metadata?.guildId;
      if (guildId) {
        await upsertPremium({
          guildId,
          customerId: (sub.customer as string) ?? null,
          subscriptionId: sub.id,
          status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
          currentPeriodEnd: periodEnd(sub),
        });
      }
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("ok");
}

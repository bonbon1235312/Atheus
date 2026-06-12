import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type PlatformEntitlement = {
  plan: "free" | "premium" | "grandfathered";
  premium_status: "none" | "trialing" | "active" | "past_due" | "cancelled";
  premium_current_period_end: string | null;
  free_claimed_at: string | null;
  creation_blocked_at: string | null;
};

export function hasActivePremium(entitlement: PlatformEntitlement | null) {
  if (!entitlement) {
    return false;
  }

  if (entitlement.plan === "grandfathered") {
    return true;
  }

  if (
    entitlement.plan !== "premium" ||
    !["trialing", "active"].includes(entitlement.premium_status)
  ) {
    return false;
  }

  return (
    !entitlement.premium_current_period_end ||
    new Date(entitlement.premium_current_period_end).getTime() > Date.now()
  );
}

export async function getPlatformEntitlement(discordUserId: string) {
  const { data, error } = await supabaseAdmin()
    .from("platform_entitlements")
    .select(
      "plan, premium_status, premium_current_period_end, free_claimed_at, creation_blocked_at",
    )
    .eq("discord_user_id", discordUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PlatformEntitlement | null) ?? null;
}

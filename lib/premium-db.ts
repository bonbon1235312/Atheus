import { supabaseAdmin } from "@/lib/supabase-admin";

// Writes the `premium` table that the bot's isGuildPremium() reads.
export async function upsertPremium(row: {
  guildId: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  currentPeriodEnd: string | null;
}) {
  const { error } = await supabaseAdmin()
    .from("premium")
    .upsert(
      {
        guild_id: row.guildId,
        stripe_customer_id: row.customerId,
        stripe_subscription_id: row.subscriptionId,
        status: row.status,
        current_period_end: row.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "guild_id" }
    );
  if (error) throw error;
}

// All-access (account-level) premium, keyed by the owner's Discord user ID.
export async function upsertAccountPremium(row: {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  currentPeriodEnd: string | null;
}) {
  const { error } = await supabaseAdmin()
    .from("account_premium")
    .upsert(
      {
        user_id: row.userId,
        stripe_customer_id: row.customerId,
        stripe_subscription_id: row.subscriptionId,
        status: row.status,
        current_period_end: row.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  if (error) throw error;
}

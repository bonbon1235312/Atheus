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

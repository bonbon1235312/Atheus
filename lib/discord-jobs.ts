import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function enqueueDiscordJob(input: {
  leagueId: string;
  discordGuildId: string;
  jobType: string;
  idempotencyKey: string;
  payload?: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin()
    .from("discord_jobs")
    .upsert(
      {
        league_id: input.leagueId,
        discord_guild_id: input.discordGuildId,
        job_type: input.jobType,
        idempotency_key: input.idempotencyKey,
        payload: input.payload ?? {},
        status: "pending",
        available_at: new Date().toISOString(),
      },
      {
        onConflict: "league_id,idempotency_key",
        ignoreDuplicates: true,
      },
    );

  if (error) {
    throw error;
  }
}

import "server-only";

import { enqueueDiscordJob } from "@/lib/discord-jobs";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type AutoActivateResult = {
  ok: boolean;
  alreadyActive: boolean;
  setupQueued: boolean;
};

/**
 * Bring a league live without the competition-readiness gate used by the
 * `activate_league` RPC (season + schedule slot + two linked teams).
 *
 * The free / premium entitlement gate is already enforced transactionally
 * inside `create_league_onboarding`, so any league that exists is within its
 * account's allowance. That means activation no longer needs a manual click or
 * a fully built season — the league simply goes live and the owner fills in
 * teams and fixtures afterwards.
 *
 * The status flip is guarded on `status = 'draft'`, so this is idempotent and
 * safe to call more than once (including the manual Activate button).
 */
export async function autoActivateLeague(input: {
  leagueId: string;
  discordUserId: string;
  discordGuildId: string;
  guildMemberCount: number | null;
}): Promise<AutoActivateResult> {
  const database = supabaseAdmin();
  const now = new Date().toISOString();

  const { data: current, error: readError } = await database
    .from("leagues")
    .select("status")
    .eq("id", input.leagueId)
    .maybeSingle();

  if (readError || !current) {
    return { ok: false, alreadyActive: false, setupQueued: false };
  }

  let alreadyActive = current.status === "active";

  if (!alreadyActive) {
    const { data: flipped, error: flipError } = await database
      .from("leagues")
      .update({ status: "active", activated_at: now, updated_at: now })
      .eq("id", input.leagueId)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();

    if (flipError) {
      return { ok: false, alreadyActive: false, setupQueued: false };
    }

    if (!flipped) {
      // Another request won the race, or the league is suspended/archived
      // (which must not be silently reactivated). Re-read to decide.
      const { data: after } = await database
        .from("leagues")
        .select("status")
        .eq("id", input.leagueId)
        .maybeSingle();
      alreadyActive = after?.status === "active";
      if (!alreadyActive) {
        return { ok: false, alreadyActive: false, setupQueued: false };
      }
    } else {
      // Refresh the guild verification snapshot and promote a draft season if
      // the owner already created one. Both are best-effort polish on top of
      // the activation itself.
      await database
        .from("league_discord_guilds")
        .update({
          ownership_verified_at: now,
          bot_verified_at: now,
          guild_member_count: input.guildMemberCount,
        })
        .eq("league_id", input.leagueId)
        .eq("discord_guild_id", input.discordGuildId)
        .is("unlinked_at", null);

      const { data: draftSeason } = await database
        .from("seasons")
        .select("id")
        .eq("league_id", input.leagueId)
        .eq("status", "draft")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (draftSeason?.id) {
        await database
          .from("seasons")
          .update({ status: "active", updated_at: now })
          .eq("id", draftSeason.id as string);
      }

      await database.from("audit_logs").insert({
        league_id: input.leagueId,
        actor_discord_user_id: input.discordUserId,
        action: "league.activated",
        entity_type: "league",
        entity_id: input.leagueId,
        after_data: {
          auto_activated: true,
          discord_guild_id: input.discordGuildId,
        },
      });
    }
  }

  let setupQueued = true;
  try {
    await enqueueDiscordJob({
      leagueId: input.leagueId,
      discordGuildId: input.discordGuildId,
      jobType: "guild.setup",
      idempotencyKey: `guild-setup:${input.discordGuildId}:v1`,
    });
  } catch {
    setupQueued = false;
  }

  return { ok: true, alreadyActive, setupQueued };
}

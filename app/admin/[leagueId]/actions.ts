"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  getDiscordGuildVerification,
  getManagedDiscordGuilds,
} from "@/lib/discord";
import { enqueueDiscordJob } from "@/lib/discord-jobs";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type ActivationState = {
  error?: string;
  success?: string;
};

export async function activateLeague(
  _state: ActivationState,
  formData: FormData,
): Promise<ActivationState> {
  const session = await auth();
  if (
    !session?.discordUserId ||
    !session.discordAccessToken ||
    session.discordTokenError
  ) {
    return { error: "Reconnect Discord before activating this league." };
  }

  const leagueId = String(formData.get("leagueId") ?? "");
  if (!leagueId) {
    return { error: "League identity is missing." };
  }

  const database = supabaseAdmin();
  const { data: membership } = await database
    .from("league_memberships")
    .select("role")
    .eq("league_id", leagueId)
    .eq("discord_user_id", session.discordUserId)
    .eq("active", true)
    .maybeSingle();

  if (membership?.role !== "owner") {
    return { error: "Only the league owner can activate this league." };
  }

  const { data: binding } = await database
    .from("league_discord_guilds")
    .select("discord_guild_id")
    .eq("league_id", leagueId)
    .eq("is_primary", true)
    .is("unlinked_at", null)
    .maybeSingle();

  if (!binding?.discord_guild_id) {
    return { error: "The league has no active primary Discord server." };
  }

  const [managedGuilds, verification] = await Promise.all([
    getManagedDiscordGuilds(session.discordAccessToken),
    getDiscordGuildVerification(binding.discord_guild_id as string),
  ]);
  const guild = managedGuilds.find(
    (candidate) => candidate.id === binding.discord_guild_id,
  );

  if (!guild?.owner) {
    return {
      error:
        "Activation requires the league owner to still own the linked Discord server.",
    };
  }

  if (!verification.botInstalled) {
    return { error: "Install the Atheus bot before activating the league." };
  }

  const { error } = await database.rpc("activate_league", {
    p_league_id: leagueId,
    p_discord_user_id: session.discordUserId,
    p_discord_guild_id: binding.discord_guild_id,
    p_owner_verified: true,
    p_bot_verified: true,
    p_guild_member_count: verification.memberCount,
  });

  if (error) {
    return { error: error.message };
  }

  let setupQueued = true;
  try {
    await enqueueDiscordJob({
      leagueId,
      discordGuildId: binding.discord_guild_id as string,
      jobType: "guild.setup",
      idempotencyKey: `guild-setup:${binding.discord_guild_id}:v1`,
    });
  } catch {
    setupQueued = false;
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath("/admin");
  return {
    success: setupQueued
      ? "League activated. Discord setup is queued automatically."
      : "League activated, but Discord setup needs an operator retry.",
  };
}

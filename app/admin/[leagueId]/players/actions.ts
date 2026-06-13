"use server";

import { revalidatePath } from "next/cache";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type PlayerIdentityActionState = {
  error?: string;
  success?: string;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function identityAccess(leagueId: string) {
  return requireLeagueAccess(leagueId, ["owner", "admin", "reviewer"]);
}

function refreshPlayerViews(leagueId: string, leagueSlug: string) {
  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/players`);
  revalidatePath(`/leagues/${leagueSlug}`, "layout");
}

export async function updatePlayerIdentity(
  _state: PlayerIdentityActionState,
  formData: FormData,
): Promise<PlayerIdentityActionState> {
  const leagueId = text(formData, "leagueId");
  const identityId = text(formData, "identityId");
  const canonicalName = text(formData, "canonicalName");
  const discordUserId = text(formData, "playerDiscordUserId");
  const currentTeamId = text(formData, "currentTeamId");
  const reason = text(formData, "reason");
  const access = await identityAccess(leagueId);

  if (!access) {
    return { error: "Player identity access is required." };
  }
  if (!identityId || !canonicalName || !reason) {
    return { error: "Canonical gamertag and correction reason are required." };
  }

  const { error } = await supabaseAdmin().rpc("update_player_identity", {
    p_league_id: leagueId,
    p_player_identity_id: identityId,
    p_discord_user_id: access.discordUserId,
    p_canonical_name: canonicalName,
    p_player_discord_user_id: discordUserId || null,
    p_current_team_id: currentTeamId || null,
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  refreshPlayerViews(leagueId, access.leagueSlug);
  return { success: "Player identity updated." };
}

export async function addPlayerAlias(
  _state: PlayerIdentityActionState,
  formData: FormData,
): Promise<PlayerIdentityActionState> {
  const leagueId = text(formData, "leagueId");
  const identityId = text(formData, "identityId");
  const alias = text(formData, "alias");
  const reason = text(formData, "reason");
  const access = await identityAccess(leagueId);

  if (!access) {
    return { error: "Player identity access is required." };
  }
  if (!identityId || !alias || !reason) {
    return { error: "Alias and reason are required." };
  }

  const { error } = await supabaseAdmin().rpc("add_player_alias", {
    p_league_id: leagueId,
    p_player_identity_id: identityId,
    p_discord_user_id: access.discordUserId,
    p_alias: alias,
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  refreshPlayerViews(leagueId, access.leagueSlug);
  return { success: `${alias} now resolves to this player.` };
}

export async function removePlayerAlias(formData: FormData) {
  const leagueId = text(formData, "leagueId");
  const aliasId = text(formData, "aliasId");
  const reason = text(formData, "reason");
  const access = await identityAccess(leagueId);

  if (!access || !aliasId || !reason) {
    return;
  }

  const { error } = await supabaseAdmin().rpc("remove_player_alias", {
    p_league_id: leagueId,
    p_alias_id: aliasId,
    p_discord_user_id: access.discordUserId,
    p_reason: reason,
  });

  if (error) {
    throw new Error(error.message);
  }

  refreshPlayerViews(leagueId, access.leagueSlug);
}

export async function mergePlayerIdentities(
  _state: PlayerIdentityActionState,
  formData: FormData,
): Promise<PlayerIdentityActionState> {
  const leagueId = text(formData, "leagueId");
  const sourceIdentityId = text(formData, "sourceIdentityId");
  const targetIdentityId = text(formData, "targetIdentityId");
  const reason = text(formData, "reason");
  const access = await identityAccess(leagueId);

  if (!access) {
    return { error: "Player identity access is required." };
  }
  if (
    !sourceIdentityId ||
    !targetIdentityId ||
    sourceIdentityId === targetIdentityId ||
    !reason
  ) {
    return { error: "Choose two different identities and enter a reason." };
  }

  const { error } = await supabaseAdmin().rpc("merge_player_identities", {
    p_league_id: leagueId,
    p_source_player_identity_id: sourceIdentityId,
    p_target_player_identity_id: targetIdentityId,
    p_discord_user_id: access.discordUserId,
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  refreshPlayerViews(leagueId, access.leagueSlug);
  return { success: "Duplicate identity merged into the selected player." };
}

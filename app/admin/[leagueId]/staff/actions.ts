"use server";

import { revalidatePath } from "next/cache";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type StaffActionState = {
  error?: string;
  success?: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveStaffMember(
  _state: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const leagueId = value(formData, "leagueId");
  const discordUserId = value(formData, "discordUserId");
  const role = value(formData, "role");
  const access = await requireLeagueAccess(leagueId, ["owner"]);

  if (!access) {
    return { error: "Only the league owner can manage staff." };
  }

  if (!/^\d{15,22}$/.test(discordUserId)) {
    return { error: "Enter a valid Discord user ID." };
  }

  if (!["admin", "reviewer", "fixture_manager"].includes(role)) {
    return { error: "Choose a valid staff role." };
  }

  const { error } = await supabaseAdmin().rpc("upsert_league_staff", {
    p_league_id: leagueId,
    p_actor_discord_user_id: access.discordUserId,
    p_target_discord_user_id: discordUserId,
    p_role: role,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/staff`);
  return { success: "Staff access saved." };
}

export async function removeStaffMember(
  _state: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const leagueId = value(formData, "leagueId");
  const discordUserId = value(formData, "discordUserId");
  const access = await requireLeagueAccess(leagueId, ["owner"]);

  if (!access) {
    return { error: "Only the league owner can manage staff." };
  }

  const { error } = await supabaseAdmin().rpc("remove_league_staff", {
    p_league_id: leagueId,
    p_actor_discord_user_id: access.discordUserId,
    p_target_discord_user_id: discordUserId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/staff`);
  return { success: "Staff access removed." };
}

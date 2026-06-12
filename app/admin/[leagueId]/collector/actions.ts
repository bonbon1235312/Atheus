"use server";

import { revalidatePath } from "next/cache";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type CollectorActionState = {
  error?: string;
  success?: string;
};

export async function setCollectorEnabled(
  leagueId: string,
  enabled: boolean,
  previousState: CollectorActionState,
): Promise<CollectorActionState> {
  void previousState;
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    return { error: "League owner or admin access is required." };
  }

  const { error } = await supabaseAdmin().rpc(
    "set_league_collector_enabled",
    {
      p_league_id: leagueId,
      p_actor_discord_user_id: access.discordUserId,
      p_enabled: enabled,
    },
  );
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/collector`);
  return {
    success: enabled
      ? "Collector enabled. It will wake only inside configured fixture windows."
      : "Collector paused. Existing imports and approved data are unchanged.",
  };
}

"use server";

import { revalidatePath } from "next/cache";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type ImportReviewState = {
  error?: string;
  success?: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function approveImport(
  _state: ImportReviewState,
  formData: FormData,
): Promise<ImportReviewState> {
  const leagueId = value(formData, "leagueId");
  const importId = value(formData, "importId");
  const note = value(formData, "note");
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "reviewer",
  ]);

  if (!access) {
    return { error: "Match reviewer access is required." };
  }

  const { error } = await supabaseAdmin().rpc("approve_match_import", {
    p_league_id: leagueId,
    p_import_id: importId,
    p_discord_user_id: access.discordUserId,
    p_review_note: note || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/imports`);
  return { success: "Stats approved and published." };
}

export async function rejectImport(
  _state: ImportReviewState,
  formData: FormData,
): Promise<ImportReviewState> {
  const leagueId = value(formData, "leagueId");
  const importId = value(formData, "importId");
  const note = value(formData, "note");
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "reviewer",
  ]);

  if (!access) {
    return { error: "Match reviewer access is required." };
  }

  if (!note) {
    return { error: "Enter a reason before rejecting an import." };
  }

  const { error } = await supabaseAdmin().rpc("reject_match_import", {
    p_league_id: leagueId,
    p_import_id: importId,
    p_discord_user_id: access.discordUserId,
    p_review_note: note,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/imports`);
  return { success: "Import rejected without changing public data." };
}

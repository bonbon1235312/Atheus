"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  hashSitePassword,
  validateSitePassword,
  validateSiteUsername,
} from "@/lib/site-credentials";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type SiteAccessState = {
  error?: string;
  success?: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateSiteCredential(
  _state: SiteAccessState,
  formData: FormData,
): Promise<SiteAccessState> {
  const session = await auth();
  if (
    !session?.discordUserId ||
    session.authMethod !== "discord" ||
    !session.discordAccessToken
  ) {
    return {
      error: "Only the Discord league owner can change site credentials.",
    };
  }

  const leagueId = value(formData, "leagueId");
  const username = value(formData, "siteUsername");
  const password = String(formData.get("sitePassword") ?? "");
  const passwordConfirm = String(
    formData.get("sitePasswordConfirm") ?? "",
  );

  if (!leagueId || !validateSiteUsername(username)) {
    return {
      error:
        "The username must be 3-32 characters using letters, numbers, dots, dashes or underscores.",
    };
  }
  if (!validateSitePassword(password)) {
    return { error: "The new password must be 12-128 characters." };
  }
  if (password !== passwordConfirm) {
    return { error: "The two passwords do not match." };
  }

  const passwordHash = await hashSitePassword(password);
  const { error } = await supabaseAdmin().rpc(
    "set_league_site_credential",
    {
      p_league_id: leagueId,
      p_actor_discord_user_id: session.discordUserId,
      p_username: username,
      p_password_hash: passwordHash,
    },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/site-access`);
  return {
    success:
      "Site credentials updated. Existing site sessions are now invalid; share the new password through a private channel.",
  };
}

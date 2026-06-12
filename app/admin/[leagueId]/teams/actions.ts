"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifyEaSelectionToken } from "@/lib/ea-selection-token";
import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type TeamActionState = {
  error?: string;
  success?: string;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nullableHex(value: string) {
  if (!value) {
    return null;
  }
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : undefined;
}

export async function createTeam(
  _state: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const leagueId = text(formData, "leagueId");
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    return { error: "League owner or admin access is required." };
  }

  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const abbreviation = text(formData, "abbreviation");
  const discordRoleId = text(formData, "discordRoleId");
  const primaryColour = nullableHex(text(formData, "primaryColour"));
  const secondaryColour = nullableHex(text(formData, "secondaryColour"));
  const selectionToken = text(formData, "selectionToken");

  if (!name || name.length > 80 || !slug) {
    return { error: "Enter a valid team name of 80 characters or fewer." };
  }
  if (abbreviation && (abbreviation.length < 2 || abbreviation.length > 8)) {
    return { error: "Abbreviation must contain 2 to 8 characters." };
  }
  if (primaryColour === undefined || secondaryColour === undefined) {
    return { error: "Team colours must be complete six-digit hex codes." };
  }

  const candidate = selectionToken
    ? verifyEaSelectionToken(
        selectionToken,
        leagueId,
        access.discordUserId,
      )
    : null;

  if (selectionToken && !candidate) {
    return { error: "That EA selection expired. Search and select it again." };
  }

  const { error } = await supabaseAdmin().rpc("create_league_team", {
    p_league_id: leagueId,
    p_discord_user_id: access.discordUserId,
    p_name: name,
    p_slug: slug,
    p_abbreviation: abbreviation || null,
    p_discord_role_id: discordRoleId || null,
    p_primary_colour: primaryColour,
    p_secondary_colour: secondaryColour,
    p_ea_club_id: candidate?.clubId ?? null,
    p_ea_club_name: candidate?.name ?? null,
    p_platform: candidate?.platform ?? null,
    p_verification_snapshot: candidate ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "This team address, Discord role, or EA club is already in use in the league.",
      };
    }
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/teams`);
  redirect(`/admin/${leagueId}/teams`);
}

export async function linkTeamEaClub(
  _state: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const leagueId = text(formData, "leagueId");
  const teamId = text(formData, "teamId");
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    return { error: "League owner or admin access is required." };
  }

  const candidate = verifyEaSelectionToken(
    text(formData, "selectionToken"),
    leagueId,
    access.discordUserId,
  );
  if (!candidate) {
    return { error: "That EA selection expired. Search and select it again." };
  }

  const { error } = await supabaseAdmin().rpc("set_team_ea_club_link", {
    p_league_id: leagueId,
    p_team_id: teamId,
    p_discord_user_id: access.discordUserId,
    p_ea_club_id: candidate.clubId,
    p_ea_club_name: candidate.name,
    p_platform: candidate.platform,
    p_verification_snapshot: candidate,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That EA club is already linked to another active team." };
    }
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/teams`);
  return { success: `${candidate.name} is now linked.` };
}

export async function unlinkTeamEaClub(formData: FormData) {
  const leagueId = text(formData, "leagueId");
  const teamId = text(formData, "teamId");
  const platform = text(formData, "platform");
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    return;
  }

  const { error } = await supabaseAdmin().rpc("unlink_team_ea_club", {
    p_league_id: leagueId,
    p_team_id: teamId,
    p_discord_user_id: access.discordUserId,
    p_platform: platform,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/teams`);
}

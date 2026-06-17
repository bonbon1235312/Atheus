"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifyEaSelectionToken } from "@/lib/ea-selection-token";
import { localKickoffToUtc } from "@/lib/fixture-generator";
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

export async function replaceTeam(
  _state: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const leagueId = text(formData, "leagueId");
  const seasonId = text(formData, "seasonId");
  const outgoingTeamId = text(formData, "outgoingTeamId");
  const incomingTeamId = text(formData, "incomingTeamId");
  const effectiveLocal = text(formData, "effectiveLocal");
  const reason = text(formData, "reason");
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);

  if (!access) {
    return { error: "League owner or admin access is required." };
  }
  if (
    !seasonId ||
    !outgoingTeamId ||
    !incomingTeamId ||
    outgoingTeamId === incomingTeamId ||
    !reason
  ) {
    return {
      error:
        "Choose the season, outgoing team and incoming team, then enter a reason.",
    };
  }

  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(effectiveLocal);
  if (!match) {
    return { error: "Choose a valid effective date and time." };
  }

  let effectiveAt: string;
  try {
    effectiveAt = localKickoffToUtc(match[1], match[2], access.timezone);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "The effective time could not be converted.",
    };
  }

  const { data, error } = await supabaseAdmin().rpc("replace_league_team", {
    p_league_id: leagueId,
    p_season_id: seasonId,
    p_outgoing_team_id: outgoingTeamId,
    p_incoming_team_id: incomingTeamId,
    p_discord_user_id: access.discordUserId,
    p_effective_at: effectiveAt,
    p_transfer_future_fixtures:
      formData.get("transferFutureFixtures") === "on",
    p_transfer_table_record: formData.get("transferTableRecord") === "on",
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  const result = data as {
    transferred_future_fixtures?: number;
    transferred_division_slots?: number;
  } | null;
  const transferred = Number(result?.transferred_future_fixtures ?? 0);
  const divisionSlots = Number(result?.transferred_division_slots ?? 0);

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/teams`);
  revalidatePath(`/admin/${leagueId}/fixtures`);
  revalidatePath(`/admin/${leagueId}/divisions`);
  revalidatePath(`/leagues/${access.leagueSlug}`, "layout");

  const divisionNote = divisionSlots
    ? ` Division roster updated in ${divisionSlots} division${divisionSlots === 1 ? "" : "s"}.`
    : "";

  return {
    success: `Team replaced. ${transferred} future fixture${transferred === 1 ? "" : "s"} transferred.${divisionNote}`,
  };
}

"use server";

import { revalidatePath } from "next/cache";

import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type DivisionActionState = {
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

export async function createDivision(
  _state: DivisionActionState,
  formData: FormData,
): Promise<DivisionActionState> {
  const leagueId = text(formData, "leagueId");
  const seasonId = text(formData, "seasonId");
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    return { error: "Owner or admin access is required." };
  }

  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);

  if (!name) {
    return { error: "Enter a division name." };
  }
  if (!slug) {
    return { error: "The name could not be turned into a valid slug." };
  }
  if (!seasonId) {
    return { error: "Season is missing." };
  }

  const { error } = await supabaseAdmin().rpc("create_division", {
    p_league_id: leagueId,
    p_season_id: seasonId,
    p_discord_user_id: access.discordUserId,
    p_name: name,
    p_slug: slug,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "A division with this name or address already exists in this season.",
      };
    }
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}/divisions`);
  revalidatePath(`/admin/${leagueId}`);
  return { success: `${name} created.` };
}

export async function renameDivision(
  _state: DivisionActionState,
  formData: FormData,
): Promise<DivisionActionState> {
  const leagueId = text(formData, "leagueId");
  const competitionId = text(formData, "competitionId");
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    return { error: "Owner or admin access is required." };
  }

  const name = text(formData, "name");
  if (!name) {
    return { error: "Enter a name." };
  }

  const { error } = await supabaseAdmin().rpc("rename_division", {
    p_league_id: leagueId,
    p_competition_id: competitionId,
    p_discord_user_id: access.discordUserId,
    p_name: name,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}/divisions`);
  return { success: "Renamed." };
}

export async function addTeamToDivision(
  _state: DivisionActionState,
  formData: FormData,
): Promise<DivisionActionState> {
  const leagueId = text(formData, "leagueId");
  const competitionId = text(formData, "competitionId");
  const teamId = text(formData, "teamId");

  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    return { error: "Owner or admin access is required." };
  }

  if (!competitionId || !teamId) {
    return { error: "Select a team to add." };
  }

  const { error } = await supabaseAdmin().rpc("add_team_to_division", {
    p_league_id: leagueId,
    p_competition_id: competitionId,
    p_team_id: teamId,
    p_discord_user_id: access.discordUserId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}/divisions`);
  return { success: "Team added." };
}

export async function removeTeamFromDivision(formData: FormData) {
  const leagueId = text(formData, "leagueId");
  const competitionId = text(formData, "competitionId");
  const teamId = text(formData, "teamId");

  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);
  if (!access) {
    return;
  }

  const { error } = await supabaseAdmin().rpc("remove_team_from_division", {
    p_league_id: leagueId,
    p_competition_id: competitionId,
    p_team_id: teamId,
    p_discord_user_id: access.discordUserId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/${leagueId}/divisions`);
}

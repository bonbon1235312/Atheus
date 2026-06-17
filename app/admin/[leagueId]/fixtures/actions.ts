"use server";

import { revalidatePath } from "next/cache";

import {
  generateFixturePlan,
  localKickoffToUtc,
  type FixturePlan,
  type FixtureSlot,
  type FixtureTeam,
} from "@/lib/fixture-generator";
import {
  issueFixturePlanToken,
  verifyFixturePlanToken,
} from "@/lib/fixture-plan-token";
import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type FixturePreviewState = {
  error?: string;
  plan?: FixturePlan;
  planToken?: string;
};

export type FixturePublishState = {
  error?: string;
  success?: string;
};

export type FixtureControlState = {
  error?: string;
  success?: string;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function integer(formData: FormData, key: string) {
  return Number(text(formData, key));
}

export async function previewFixturePlan(
  _state: FixturePreviewState,
  formData: FormData,
): Promise<FixturePreviewState> {
  const leagueId = text(formData, "leagueId");
  const competitionId = text(formData, "competitionId");
  const firstDate = text(formData, "firstDate");
  const meetingsPerPair = integer(formData, "meetingsPerPair");
  const maxMatchesPerTeamPerGameDay = integer(
    formData,
    "maxMatchesPerTeamPerGameDay",
  );
  const teamIds = [...new Set(formData.getAll("teamIds").map(String))];
  const blackoutDates = text(formData, "blackoutDates")
    .split(",")
    .map((date) => date.trim())
    .filter(Boolean);

  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "fixture_manager",
  ]);
  if (!access) {
    return { error: "Fixture manager access is required." };
  }
  if (!competitionId || !firstDate) {
    return { error: "Choose a competition and first match date." };
  }
  if (teamIds.length < 2) {
    return { error: "Select at least two teams." };
  }

  const database = supabaseAdmin();
  const { data: competition } = await database
    .from("competitions")
    .select("id, season_id, name, kind")
    .eq("league_id", leagueId)
    .eq("id", competitionId)
    .eq("active", true)
    .maybeSingle();

  if (!competition) {
    return { error: "The selected competition is not available." };
  }
  if (competition.kind !== "league") {
    return {
      error:
        "Round-robin generation is currently available for league competitions only.",
    };
  }

  const [
    { data: season },
    { data: slots },
    { data: teams },
    { data: activeLinks },
    { count },
  ] = await Promise.all([
      database
        .from("seasons")
        .select("id, ends_on")
        .eq("league_id", leagueId)
        .eq("id", competition.season_id)
        .single(),
      database
        .from("league_schedule_slots")
        .select("weekday, local_kickoff_time")
        .eq("league_id", leagueId)
        .eq("season_id", competition.season_id)
        .eq("active", true),
      database
        .from("teams")
        .select("id, name, abbreviation")
        .eq("league_id", leagueId)
        .eq("status", "active")
        .in("id", teamIds),
      database
        .from("team_ea_club_links")
        .select("team_id")
        .eq("league_id", leagueId)
        .is("inactive_at", null)
        .in("team_id", teamIds),
      database
        .from("fixtures")
        .select("id", { count: "exact", head: true })
        .eq("league_id", leagueId)
        .eq("competition_id", competitionId),
    ]);

  if (count) {
    return {
      error:
        "This competition already has fixtures. Existing schedules must be edited rather than regenerated.",
    };
  }
  if (!season || !slots?.length) {
    return { error: "The season has no active match windows." };
  }
  if (!teams || teams.length !== teamIds.length) {
    return { error: "One or more selected teams are inactive or unavailable." };
  }

  try {
    const plan = generateFixturePlan({
      competitionId,
      teams: teams as FixtureTeam[],
      slots: slots.map(
        (slot) =>
          ({
            weekday: Number(slot.weekday),
            localKickoffTime: String(slot.local_kickoff_time),
          }) satisfies FixtureSlot,
      ),
      firstDate,
      timezone: access.timezone,
      meetingsPerPair,
      maxMatchesPerTeamPerGameDay,
      blackoutDates,
      seasonEndsOn: season.ends_on as string | null,
    });
    const linkedTeamIds = new Set(
      (activeLinks ?? []).map((link) => link.team_id as string),
    );
    const unlinkedTeams = teams.filter(
      (team) => !linkedTeamIds.has(team.id as string),
    );
    if (unlinkedTeams.length) {
      plan.warnings.push(
        `${unlinkedTeams.length} selected team${unlinkedTeams.length === 1 ? "" : "s"} lack an EA club link. Fixtures can publish, but automated collection will skip them until linked.`,
      );
    }

    return {
      plan,
      planToken: issueFixturePlanToken({
        leagueId,
        seasonId: competition.season_id as string,
        competitionId,
        discordUserId: access.discordUserId,
        plan,
      }),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "The fixture plan could not be generated.",
    };
  }
}

export async function publishFixturePlan(
  _state: FixturePublishState,
  formData: FormData,
): Promise<FixturePublishState> {
  const leagueId = text(formData, "leagueId");
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "fixture_manager",
  ]);
  if (!access) {
    return { error: "Fixture manager access is required." };
  }

  const payload = verifyFixturePlanToken(
    text(formData, "planToken"),
    leagueId,
    access.discordUserId,
  );
  if (!payload) {
    return {
      error: "This fixture preview expired. Generate a fresh preview.",
    };
  }

  const fixtures = payload.plan.fixtures.map((fixture) => ({
    external_fixture_key: fixture.externalFixtureKey,
    gameday_number: fixture.gamedayNumber,
    round_label: fixture.roundLabel,
    kickoff_at: fixture.kickoffAt,
    home_team_id: fixture.homeTeamId,
    away_team_id: fixture.awayTeamId,
  }));

  const { data, error } = await supabaseAdmin().rpc("publish_fixture_plan", {
    p_league_id: leagueId,
    p_discord_user_id: access.discordUserId,
    p_season_id: payload.seasonId,
    p_competition_id: payload.competitionId,
    p_plan_key: payload.plan.planKey,
    p_fixtures: fixtures,
    p_generation_config: {
      timezone: payload.plan.timezone,
      meetings_per_pair: payload.plan.meetingsPerPair,
      max_matches_per_team_per_game_day:
        payload.plan.maxMatchesPerTeamPerGameDay,
      team_count: payload.plan.teamCount,
      game_day_count: payload.plan.gameDayCount,
      final_local_date: payload.plan.finalLocalDate,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/fixtures`);
  return { success: `${Number(data)} fixtures published successfully.` };
}

function refreshFixtureViews(leagueId: string, leagueSlug: string) {
  revalidatePath(`/admin/${leagueId}`);
  revalidatePath(`/admin/${leagueId}/fixtures`);
  revalidatePath(`/admin/${leagueId}/imports`);
  revalidatePath(`/leagues/${leagueSlug}`, "layout");
}

export async function manageFixtureLifecycle(
  _state: FixtureControlState,
  formData: FormData,
): Promise<FixtureControlState> {
  const leagueId = text(formData, "leagueId");
  const fixtureId = text(formData, "fixtureId");
  const action = text(formData, "fixtureAction");
  const reason = text(formData, "reason");
  const localKickoff = text(formData, "localKickoff");
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "fixture_manager",
  ]);

  if (!access) {
    return { error: "Fixture manager access is required." };
  }
  if (!fixtureId || !reason) {
    return { error: "Choose a fixture action and enter a reason." };
  }
  if (!["reschedule", "postpone", "cancel", "restore"].includes(action)) {
    return { error: "Choose a valid fixture action." };
  }

  let kickoffAt: string | null = null;
  if (action === "reschedule") {
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(localKickoff);
    if (!match) {
      return { error: "Choose a valid local kickoff date and time." };
    }
    try {
      kickoffAt = localKickoffToUtc(match[1], match[2], access.timezone);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "The kickoff time could not be converted.",
      };
    }
  }

  const { error } = await supabaseAdmin().rpc("manage_fixture_lifecycle", {
    p_league_id: leagueId,
    p_fixture_id: fixtureId,
    p_discord_user_id: access.discordUserId,
    p_action: action,
    p_kickoff_at: kickoffAt,
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  refreshFixtureViews(leagueId, access.leagueSlug);
  return {
    success:
      action === "reschedule"
        ? "Fixture rescheduled."
        : `Fixture marked ${action === "restore" ? "scheduled" : action + "d"}.`,
  };
}

export async function overrideFixtureResult(
  _state: FixtureControlState,
  formData: FormData,
): Promise<FixtureControlState> {
  const leagueId = text(formData, "leagueId");
  const fixtureId = text(formData, "fixtureId");
  const reason = text(formData, "reason");
  const homeScore = integer(formData, "homeScore");
  const awayScore = integer(formData, "awayScore");
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "reviewer",
  ]);

  if (!access) {
    return { error: "Match reviewer access is required." };
  }
  if (
    !fixtureId ||
    !reason ||
    !Number.isInteger(homeScore) ||
    homeScore < 0 ||
    !Number.isInteger(awayScore) ||
    awayScore < 0
  ) {
    return { error: "Enter both scores and a correction reason." };
  }

  const { error } = await supabaseAdmin().rpc("override_fixture_result", {
    p_league_id: leagueId,
    p_fixture_id: fixtureId,
    p_discord_user_id: access.discordUserId,
    p_home_score: homeScore,
    p_away_score: awayScore,
    p_is_forfeit: formData.get("isForfeit") === "on",
    p_erase_player_stats: formData.get("erasePlayerStats") === "on",
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  refreshFixtureViews(leagueId, access.leagueSlug);
  return { success: "Result saved and public views refreshed." };
}

export async function clearDivisionFixtures(
  _state: FixtureControlState,
  formData: FormData,
): Promise<FixtureControlState> {
  const leagueId = text(formData, "leagueId");
  const competitionId = text(formData, "competitionId");
  const confirmation = text(formData, "confirmation");
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "fixture_manager",
  ]);

  if (!access) {
    return { error: "Fixture manager access is required." };
  }
  if (!competitionId) {
    return { error: "Choose a division to clear." };
  }
  if (confirmation !== "CLEAR") {
    return { error: "Type CLEAR to confirm." };
  }

  const { data, error } = await supabaseAdmin().rpc("clear_division_fixtures", {
    p_league_id: leagueId,
    p_competition_id: competitionId,
    p_discord_user_id: access.discordUserId,
  });

  if (error) {
    return { error: error.message };
  }

  refreshFixtureViews(leagueId, access.leagueSlug);
  return {
    success: `${Number(data)} fixture${Number(data) === 1 ? "" : "s"} cleared. This division can be regenerated.`,
  };
}

export async function eraseFixturePlayerStats(
  _state: FixtureControlState,
  formData: FormData,
): Promise<FixtureControlState> {
  const leagueId = text(formData, "leagueId");
  const fixtureId = text(formData, "fixtureId");
  const reason = text(formData, "reason");
  const confirmation = text(formData, "confirmation");
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "reviewer",
  ]);

  if (!access) {
    return { error: "Match reviewer access is required." };
  }
  if (confirmation !== "ERASE" || !reason) {
    return { error: "Enter a reason and type ERASE to confirm." };
  }

  const { data, error } = await supabaseAdmin().rpc(
    "erase_fixture_player_stats",
    {
      p_league_id: leagueId,
      p_fixture_id: fixtureId,
      p_discord_user_id: access.discordUserId,
      p_reason: reason,
    },
  );

  if (error) {
    return { error: error.message };
  }

  refreshFixtureViews(leagueId, access.leagueSlug);
  return {
    success: `${Number(data)} player stat row${Number(data) === 1 ? "" : "s"} erased. The score was preserved.`,
  };
}

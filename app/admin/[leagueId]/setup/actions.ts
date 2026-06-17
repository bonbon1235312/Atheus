"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type ConfigureSeasonState = {
  error?: string;
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

export async function configureSeason(
  _state: ConfigureSeasonState,
  formData: FormData,
): Promise<ConfigureSeasonState> {
  const session = await auth();
  if (!session?.discordUserId) {
    return { error: "Sign in with Discord again before continuing." };
  }

  const leagueId = text(formData, "leagueId");
  const seasonName = text(formData, "seasonName");
  const seasonSlug = slugify(text(formData, "seasonSlug") || seasonName);
  const startsOn = text(formData, "startsOn") || null;
  const endsOn = text(formData, "endsOn") || null;
  const includeCup = formData.get("includeCup") === "on";
  const selectedDays = formData
    .getAll("weekdays")
    .map(String)
    .map(Number)
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  const kickoffTimes = text(formData, "kickoffTimes")
    .split(",")
    .map((time) => time.trim())
    .filter(Boolean);

  if (!leagueId || !seasonName || !seasonSlug) {
    return { error: "Enter a name for the first season." };
  }

  if (!selectedDays.length) {
    return { error: "Choose at least one regular matchday." };
  }

  if (
    !kickoffTimes.length ||
    kickoffTimes.some((time) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
  ) {
    return {
      error: "Enter kickoff times as 24-hour values separated by commas.",
    };
  }

  const slots = selectedDays.flatMap((weekday) =>
    kickoffTimes.map((kickoff_time) => ({ weekday, kickoff_time })),
  );

  const { error } = await supabaseAdmin().rpc(
    "configure_league_foundation",
    {
      p_league_id: leagueId,
      p_discord_user_id: session.discordUserId,
      p_season_name: seasonName,
      p_season_slug: seasonSlug,
      p_starts_on: startsOn,
      p_ends_on: endsOn,
      p_include_cup: includeCup,
      p_slots: slots,
    },
  );

  if (error) {
    if (error.code === "23505") {
      return { error: "A season with this name or match window already exists." };
    }
    return { error: error.message };
  }

  redirect(`/admin/${leagueId}/divisions?created=season`);
}

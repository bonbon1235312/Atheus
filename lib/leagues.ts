import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type LeagueSummary = {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  status: string;
  timezone: string;
  role: string;
};

export async function getLeaguesForDiscordUser(
  discordUserId: string,
): Promise<LeagueSummary[]> {
  const database = supabaseAdmin();
  const { data: memberships, error: membershipError } = await database
    .from("league_memberships")
    .select("league_id, role")
    .eq("discord_user_id", discordUserId)
    .eq("active", true);

  if (membershipError) {
    throw membershipError;
  }

  if (!memberships?.length) {
    return [];
  }

  const roleByLeague = new Map(
    memberships.map((membership) => [
      membership.league_id as string,
      membership.role as string,
    ]),
  );

  const { data: leagues, error: leagueError } = await database
    .from("leagues")
    .select("id, name, slug, short_name, status, timezone")
    .in("id", [...roleByLeague.keys()])
    .order("created_at", { ascending: false });

  if (leagueError) {
    throw leagueError;
  }

  return (leagues ?? []).map((league) => ({
    ...(league as Omit<LeagueSummary, "role">),
    role: roleByLeague.get(league.id as string) ?? "member",
  }));
}

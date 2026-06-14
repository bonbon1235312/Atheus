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
  siteCredentialConfigured: boolean;
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

  const leagueIds = [...roleByLeague.keys()];
  const [{ data: leagues, error: leagueError }, { data: credentials }] =
    await Promise.all([
      database
        .from("leagues")
        .select("id, name, slug, short_name, status, timezone")
        .in("id", leagueIds)
        .order("created_at", { ascending: false }),
      database
        .from("league_site_credentials")
        .select("league_id")
        .in("league_id", leagueIds),
    ]);

  if (leagueError) {
    throw leagueError;
  }

  const credentialLeagueIds = new Set(
    (credentials ?? []).map((credential) => credential.league_id as string),
  );

  return (leagues ?? []).map((league) => ({
    ...(league as Omit<
      LeagueSummary,
      "role" | "siteCredentialConfigured"
    >),
    role: roleByLeague.get(league.id as string) ?? "member",
    siteCredentialConfigured: credentialLeagueIds.has(league.id as string),
  }));
}

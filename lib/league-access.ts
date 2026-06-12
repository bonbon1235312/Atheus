import "server-only";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type LeagueAccess = {
  leagueId: string;
  leagueSlug: string;
  leagueName: string;
  defaultPlatform: string;
  timezone: string;
  discordUserId: string;
  role: string;
};

export async function requireLeagueAccess(
  leagueId: string,
  allowedRoles?: string[],
): Promise<LeagueAccess | null> {
  const session = await auth();
  if (!session?.discordUserId) {
    return null;
  }

  const database = supabaseAdmin();
  const { data: membership } = await database
    .from("league_memberships")
    .select("role")
    .eq("league_id", leagueId)
    .eq("discord_user_id", session.discordUserId)
    .eq("active", true)
    .maybeSingle();

  if (
    !membership ||
    (allowedRoles?.length && !allowedRoles.includes(membership.role as string))
  ) {
    return null;
  }

  const { data: league } = await database
    .from("leagues")
    .select("name, slug, default_platform, timezone")
    .eq("id", leagueId)
    .single();

  if (!league) {
    return null;
  }

  return {
    leagueId,
    leagueSlug: league.slug as string,
    leagueName: league.name as string,
    defaultPlatform: league.default_platform as string,
    timezone: league.timezone as string,
    discordUserId: session.discordUserId,
    role: membership.role as string,
  };
}

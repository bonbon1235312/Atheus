import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchUserGuilds, canManage, type DiscordGuild } from "@/lib/discord";

/** Require a logged-in session; returns it (with accessToken) or redirects home. */
export async function requireSession() {
  const session = await auth();
  if (!session?.accessToken) redirect("/dashboard");
  return session;
}

/**
 * Require that the logged-in user can manage `guildId`. Returns the guild, or
 * redirects to the server picker. This is the dashboard's access control —
 * we never trust a guildId from the URL without this check.
 */
export async function requireManagedGuild(guildId: string): Promise<DiscordGuild> {
  const session = await requireSession();
  const guilds = await fetchUserGuilds(session.accessToken!);
  const guild = guilds.find((g) => g.id === guildId && canManage(g));
  if (!guild) redirect("/dashboard");
  return guild;
}

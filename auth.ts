import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";

import {
  hashSitePassword,
  normalizeSiteUsername,
  siteActorId,
  verifySitePassword,
} from "@/lib/site-credentials";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function refreshDiscordToken(token: {
  discordRefreshToken?: string;
  discordAccessToken?: string;
  discordTokenExpiresAt?: number;
  [key: string]: unknown;
}) {
  if (!token.discordRefreshToken) {
    return { ...token, discordTokenError: "RefreshTokenMissing" };
  }

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_DISCORD_ID ?? "",
      client_secret: process.env.AUTH_DISCORD_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: token.discordRefreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return { ...token, discordTokenError: "RefreshAccessTokenError" };
  }

  const refreshed = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  return {
    ...token,
    discordAccessToken: refreshed.access_token,
    discordRefreshToken:
      refreshed.refresh_token ?? token.discordRefreshToken,
    discordTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
    discordTokenError: undefined,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: { params: { scope: "identify guilds" } },
    }),
    Credentials({
      id: "league-admin",
      name: "League site administrator",
      credentials: {
        leagueSlug: { label: "League address", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const leagueSlug = String(credentials.leagueSlug ?? "")
          .trim()
          .toLowerCase();
        const username = normalizeSiteUsername(
          String(credentials.username ?? ""),
        );
        const password = String(credentials.password ?? "");
        const database = supabaseAdmin();

        const { data: league } = await database
          .from("leagues")
          .select("id, name, slug")
          .eq("slug", leagueSlug)
          .maybeSingle();

        const { data: credential } = league
          ? await database
              .from("league_site_credentials")
              .select(
                "username, normalized_username, password_hash, failed_attempts, locked_until, password_changed_at",
              )
              .eq("league_id", league.id)
              .eq("normalized_username", username)
              .maybeSingle()
          : { data: null };

        if (!league || !credential) {
          // Keep unknown-account responses close to valid-account timing.
          await hashSitePassword("invalid-site-credential");
          return null;
        }

        const lockedUntil = credential.locked_until
          ? new Date(credential.locked_until as string)
          : null;
        if (lockedUntil && lockedUntil.getTime() > Date.now()) {
          return null;
        }

        const valid = await verifySitePassword(
          password,
          credential.password_hash as string,
        );
        if (!valid) {
          const failedAttempts = Number(credential.failed_attempts ?? 0) + 1;
          await database
            .from("league_site_credentials")
            .update({
              failed_attempts: failedAttempts >= 5 ? 0 : failedAttempts,
              locked_until:
                failedAttempts >= 5
                  ? new Date(Date.now() + 15 * 60_000).toISOString()
                  : null,
              updated_at: new Date().toISOString(),
            })
            .eq("league_id", league.id);
          return null;
        }

        await database
          .from("league_site_credentials")
          .update({
            failed_attempts: 0,
            locked_until: null,
            last_signed_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("league_id", league.id);

        return {
          id: siteActorId(league.id as string),
          name: credential.username as string,
          siteLeagueId: league.id as string,
          siteLeagueSlug: league.slug as string,
          siteCredentialVersion: credential.password_changed_at as string,
          authMethod: "league-admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.access_token) {
        token.authMethod = "discord";
        token.discordAccessToken = account.access_token;
        token.discordRefreshToken = account.refresh_token;
        token.discordTokenExpiresAt =
          (account.expires_at ?? Math.floor(Date.now() / 1000) + 604800) * 1000;
      }
      if (account?.providerAccountId) {
        token.discordUserId = account.providerAccountId;
      }

      if (user?.authMethod === "league-admin" && user.siteLeagueId) {
        token.authMethod = "league-admin";
        token.siteLeagueId = user.siteLeagueId;
        token.siteLeagueSlug = user.siteLeagueSlug;
        token.siteCredentialVersion = user.siteCredentialVersion;
        token.discordUserId = user.id;
        token.discordAccessToken = undefined;
        token.discordRefreshToken = undefined;
        token.discordTokenExpiresAt = undefined;
        token.discordTokenError = undefined;
        return token;
      }

      if (token.authMethod === "league-admin") {
        const database = supabaseAdmin();
        const { data: credential } = await database
          .from("league_site_credentials")
          .select("password_changed_at")
          .eq("league_id", token.siteLeagueId as string)
          .maybeSingle();
        if (
          !credential ||
          credential.password_changed_at !== token.siteCredentialVersion
        ) {
          token.authMethod = undefined;
          token.discordUserId = undefined;
          token.siteLeagueId = undefined;
          token.siteLeagueSlug = undefined;
          token.siteCredentialVersion = undefined;
        }
        return token;
      }

      if (
        token.discordTokenExpiresAt &&
        Date.now() < token.discordTokenExpiresAt - 60_000
      ) {
        return token;
      }

      return refreshDiscordToken(token);
    },
    async session({ session, token }) {
      session.discordAccessToken = token.discordAccessToken as string | undefined;
      session.discordUserId = token.discordUserId as string | undefined;
      session.discordTokenError = token.discordTokenError as string | undefined;
      session.authMethod = token.authMethod as
        | "discord"
        | "league-admin"
        | undefined;
      session.siteLeagueId = token.siteLeagueId as string | undefined;
      session.siteLeagueSlug = token.siteLeagueSlug as string | undefined;
      return session;
    },
  },
});

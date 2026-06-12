import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

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
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.discordAccessToken = account.access_token;
        token.discordRefreshToken = account.refresh_token;
        token.discordTokenExpiresAt =
          (account.expires_at ?? Math.floor(Date.now() / 1000) + 604800) * 1000;
      }
      if (account?.providerAccountId) {
        token.discordUserId = account.providerAccountId;
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
      return session;
    },
  },
});

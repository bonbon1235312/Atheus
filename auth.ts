import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

// Discord OAuth for the dashboard. The `guilds` scope lets us list the servers
// the logged-in user can manage; `identify` gives us their name/avatar.
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
      // Stash the Discord access token so we can call the Discord API later.
      if (account?.access_token) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});

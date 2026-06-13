import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    discordAccessToken?: string;
    discordUserId?: string;
    discordTokenError?: string;
    authMethod?: "discord" | "league-admin";
    siteLeagueId?: string;
    siteLeagueSlug?: string;
  }

  interface User {
    authMethod?: "league-admin";
    siteLeagueId?: string;
    siteLeagueSlug?: string;
    siteCredentialVersion?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordAccessToken?: string;
    discordUserId?: string;
    discordRefreshToken?: string;
    discordTokenExpiresAt?: number;
    discordTokenError?: string;
    authMethod?: "discord" | "league-admin";
    siteLeagueId?: string;
    siteLeagueSlug?: string;
    siteCredentialVersion?: string;
  }
}

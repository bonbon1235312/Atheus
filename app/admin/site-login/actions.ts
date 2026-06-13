"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type SiteLoginState = {
  error?: string;
};

export async function siteAdminSignIn(
  _state: SiteLoginState,
  formData: FormData,
): Promise<SiteLoginState> {
  const leagueSlug = String(formData.get("leagueSlug") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!leagueSlug || !username || !password) {
    return { error: "Enter the league address, username and password." };
  }

  try {
    await signIn("league-admin", {
      leagueSlug,
      username,
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Those site credentials were not accepted. Check all three fields or wait 15 minutes after repeated attempts.",
      };
    }
    throw error;
  }

  return {};
}

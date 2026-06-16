"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/auth";
import {
  getDiscordGuildVerification,
  getManagedDiscordGuilds,
} from "@/lib/discord";
import {
  discordSnowflakeCreatedAt,
  hashAbuseSignal,
} from "@/lib/abuse-signals";
import {
  getPlatformEntitlement,
  hasActivePremium,
} from "@/lib/entitlements";
import { autoActivateLeague } from "@/lib/league-activation";
import {
  hashSitePassword,
  validateSitePassword,
  validateSiteUsername,
} from "@/lib/site-credentials";
import { RESERVED_LEAGUE_SLUGS } from "@/lib/public-url";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type CreateLeagueState = {
  error?: string;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export async function createLeague(
  _state: CreateLeagueState,
  formData: FormData,
): Promise<CreateLeagueState> {
  const session = await auth();
  if (
    !session?.discordUserId ||
    !session.discordAccessToken ||
    session.discordTokenError
  ) {
    return { error: "Your Discord session expired. Sign out and reconnect." };
  }

  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const shortName = text(formData, "shortName").slice(0, 16);
  const description = text(formData, "description").slice(0, 500);
  const guildId = text(formData, "guildId");
  const timezone = text(formData, "timezone") || "Europe/London";
  const platform = text(formData, "platform") || "common-gen5";
  const primaryColour = text(formData, "primaryColour").toUpperCase();
  const secondaryColour = text(formData, "secondaryColour").toUpperCase();
  const accentColour = text(formData, "accentColour").toUpperCase();
  const siteUsername = text(formData, "siteUsername");
  const sitePassword = String(formData.get("sitePassword") ?? "");
  const sitePasswordConfirm = String(
    formData.get("sitePasswordConfirm") ?? "",
  );

  if (!name || name.length > 80 || !slug) {
    return { error: "Enter a league name of 80 characters or fewer." };
  }

  if (RESERVED_LEAGUE_SLUGS.has(slug)) {
    return {
      error: "That public address is reserved by Atheus. Choose another.",
    };
  }

  if (
    !validHex(primaryColour) ||
    !validHex(secondaryColour) ||
    !validHex(accentColour)
  ) {
    return { error: "Theme colours must be complete six-digit hex codes." };
  }

  if (!validateSiteUsername(siteUsername)) {
    return {
      error:
        "The site username must be 3-32 characters using letters, numbers, dots, dashes or underscores.",
    };
  }

  if (!validateSitePassword(sitePassword)) {
    return { error: "The site password must be 12-128 characters." };
  }

  if (sitePassword !== sitePasswordConfirm) {
    return { error: "The two site passwords do not match." };
  }

  const managedGuilds = await getManagedDiscordGuilds(
    session.discordAccessToken,
  );
  const selectedGuild = managedGuilds.find((guild) => guild.id === guildId);

  if (!selectedGuild) {
    return { error: "You must own or manage the selected Discord server." };
  }

  if (!selectedGuild.botInstalled) {
    return { error: "Install the Atheus bot in this server before continuing." };
  }

  const entitlement = await getPlatformEntitlement(session.discordUserId);
  const premium = hasActivePremium(entitlement);

  if (entitlement?.creation_blocked_at) {
    return { error: "League creation is blocked for this account. Contact support." };
  }

  if (!premium && entitlement?.free_claimed_at) {
    return {
      error:
        "This Discord account has already used its lifetime free league. Premium is required for another.",
    };
  }

  if (!premium && !selectedGuild.owner) {
    return {
      error: "A free league must be created by the Discord server owner.",
    };
  }

  const verification = await getDiscordGuildVerification(guildId);
  if (!verification.botInstalled) {
    return { error: "Atheus could not verify its presence in this server." };
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0];
  const clientIp =
    forwardedFor ?? requestHeaders.get("x-real-ip") ?? requestHeaders.get("cf-connecting-ip");
  const userAgent = requestHeaders.get("user-agent");
  const minimumGuildMembers = Math.max(
    0,
    Number.parseInt(process.env.ATHEUS_FREE_MIN_GUILD_MEMBERS ?? "0", 10) || 0,
  );

  const database = supabaseAdmin();
  const { data: existingGuildBinding, error: guildBindingError } = await database
    .from("league_discord_guilds")
    .select("league_id")
    .eq("discord_guild_id", guildId)
    .is("unlinked_at", null)
    .maybeSingle();

  if (guildBindingError) {
    return { error: "The Discord server binding could not be verified." };
  }

  if (existingGuildBinding) {
    return {
      error:
        "That Discord server already hosts an Atheus league. Choose a different server.",
    };
  }

  const { data, error } = await database.rpc(
    "create_league_onboarding",
    {
      p_name: name,
      p_slug: slug,
      p_short_name: shortName,
      p_description: description,
      p_timezone: timezone,
      p_platform: platform,
      p_discord_guild_id: guildId,
      p_discord_user_id: session.discordUserId,
      p_primary_colour: primaryColour,
      p_secondary_colour: secondaryColour,
      p_accent_colour: accentColour,
      p_owner_verified: selectedGuild.owner,
      p_discord_account_created_at:
        discordSnowflakeCreatedAt(session.discordUserId).toISOString(),
      p_discord_guild_created_at:
        discordSnowflakeCreatedAt(guildId).toISOString(),
      p_guild_member_count: verification.memberCount,
      p_minimum_guild_members: minimumGuildMembers,
      p_ip_hash: hashAbuseSignal(clientIp),
      p_user_agent_hash: hashAbuseSignal(userAgent),
    },
  );

  if (error) {
    if (error.code === "23505") {
      return {
        error: "That Discord server or league address is already in use.",
      };
    }
    return { error: error.message };
  }

  // Auto-activate immediately. The free/premium entitlement gate has already
  // passed inside create_league_onboarding, so this league is within the
  // account's allowance and goes live without a separate "Activate" click.
  await autoActivateLeague({
    leagueId: data as string,
    discordUserId: session.discordUserId,
    discordGuildId: guildId,
    guildMemberCount: verification.memberCount,
  });

  const passwordHash = await hashSitePassword(sitePassword);
  const { error: credentialError } = await database.rpc(
    "set_league_site_credential",
    {
      p_league_id: data,
      p_actor_discord_user_id: session.discordUserId,
      p_username: siteUsername,
      p_password_hash: passwordHash,
    },
  );

  if (credentialError) {
    redirect(`/admin/${data}/site-access?setup=required`);
  }

  redirect(`/admin?created=${encodeURIComponent(slug)}`);
}

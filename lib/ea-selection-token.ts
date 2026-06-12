import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { EaClubCandidate } from "@/lib/ea-clubs";

type EaSelectionPayload = {
  candidate: EaClubCandidate;
  expiresAt: number;
  leagueId: string;
  discordUserId: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is required to sign EA club selections.");
  }
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueEaSelectionToken(
  leagueId: string,
  discordUserId: string,
  candidate: EaClubCandidate,
) {
  const payload = Buffer.from(
    JSON.stringify({
      candidate,
      expiresAt: Date.now() + 15 * 60 * 1000,
      leagueId,
      discordUserId,
    } satisfies EaSelectionPayload),
  ).toString("base64url");

  return `${payload}.${signature(payload)}`;
}

export function verifyEaSelectionToken(
  token: string,
  leagueId: string,
  discordUserId: string,
) {
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) {
    return null;
  }

  const expectedSignature = signature(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  if (
    expectedBuffer.length !== suppliedBuffer.length ||
    !timingSafeEqual(expectedBuffer, suppliedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as EaSelectionPayload;

    if (
      parsed.leagueId !== leagueId ||
      parsed.discordUserId !== discordUserId ||
      parsed.expiresAt < Date.now() ||
      !parsed.candidate?.clubId ||
      !parsed.candidate?.name
    ) {
      return null;
    }

    return parsed.candidate;
  } catch {
    return null;
  }
}

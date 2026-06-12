import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { FixturePlan } from "@/lib/fixture-generator";

type FixturePlanPayload = {
  competitionId: string;
  discordUserId: string;
  expiresAt: number;
  leagueId: string;
  plan: FixturePlan;
  seasonId: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is required to sign fixture plans.");
  }
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueFixturePlanToken(input: {
  leagueId: string;
  seasonId: string;
  competitionId: string;
  discordUserId: string;
  plan: FixturePlan;
}) {
  const payload = Buffer.from(
    JSON.stringify({
      ...input,
      expiresAt: Date.now() + 30 * 60 * 1000,
    } satisfies FixturePlanPayload),
  ).toString("base64url");

  return `${payload}.${signature(payload)}`;
}

export function verifyFixturePlanToken(
  token: string,
  leagueId: string,
  discordUserId: string,
) {
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) {
    return null;
  }

  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as FixturePlanPayload;
    if (
      parsed.leagueId !== leagueId ||
      parsed.discordUserId !== discordUserId ||
      parsed.expiresAt < Date.now() ||
      !parsed.seasonId ||
      !parsed.competitionId ||
      !parsed.plan?.fixtures?.length ||
      parsed.plan.fixtures.length > 500
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

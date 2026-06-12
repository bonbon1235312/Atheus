import "server-only";

import { createHmac } from "node:crypto";

const DISCORD_EPOCH = 1420070400000n;

export function discordSnowflakeCreatedAt(id: string) {
  if (!/^\d{15,22}$/.test(id)) {
    throw new Error("Discord returned an invalid snowflake.");
  }

  const milliseconds = (BigInt(id) >> 22n) + DISCORD_EPOCH;
  return new Date(Number(milliseconds));
}

export function hashAbuseSignal(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const secret = process.env.ABUSE_SIGNAL_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("ABUSE_SIGNAL_SECRET or AUTH_SECRET is required.");
  }

  return createHmac("sha256", secret).update(normalized).digest("hex");
}

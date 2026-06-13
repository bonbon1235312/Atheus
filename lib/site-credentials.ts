import "server-only";

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export const SITE_USERNAME_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/;
export const SITE_PASSWORD_MIN_LENGTH = 12;
export const SITE_PASSWORD_MAX_LENGTH = 128;

export function normalizeSiteUsername(username: string) {
  return username.trim().toLowerCase();
}

export function validateSiteUsername(username: string) {
  return SITE_USERNAME_PATTERN.test(username.trim());
}

export function validateSitePassword(password: string) {
  return (
    password.length >= SITE_PASSWORD_MIN_LENGTH &&
    password.length <= SITE_PASSWORD_MAX_LENGTH
  );
}

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number; maxmem: number },
) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

export async function hashSitePassword(password: string) {
  if (!validateSitePassword(password)) {
    throw new Error(
      `Site passwords must be ${SITE_PASSWORD_MIN_LENGTH}-${SITE_PASSWORD_MAX_LENGTH} characters.`,
    );
  }

  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: 64 * 1024 * 1024,
  });

  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifySitePassword(password: string, encodedHash: string) {
  const [algorithm, cost, blockSize, parallelization, saltValue, hashValue] =
    encodedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !cost ||
    !blockSize ||
    !parallelization ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  const salt = Buffer.from(saltValue, "base64url");
  const expected = Buffer.from(hashValue, "base64url");
  if (expected.length !== KEY_LENGTH) {
    return false;
  }

  try {
    const supplied = await deriveKey(password, salt, expected.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization),
      maxmem: 64 * 1024 * 1024,
    });
    return timingSafeEqual(expected, supplied);
  } catch {
    return false;
  }
}

export function siteActorId(leagueId: string) {
  return `site:${leagueId}`;
}

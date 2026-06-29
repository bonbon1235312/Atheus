import "server-only";

export type EaClubCandidate = {
  clubId: string;
  name: string;
  platform: string;
  currentDivision: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  gamesPlayed: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
};

type CacheEntry = {
  expiresAt: number;
  results: EaClubCandidate[];
};

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export class EaClubSearchError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "access_denied"
      | "rate_limited"
      | "timeout"
      | "upstream"
      | "malformed",
  ) {
    super(message);
  }
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function numberOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCandidate(
  value: unknown,
  fallbackPlatform: string,
): EaClubCandidate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const clubInfo =
    row.clubInfo && typeof row.clubInfo === "object"
      ? (row.clubInfo as Record<string, unknown>)
      : {};
  const clubId = String(row.clubId ?? clubInfo.clubId ?? "").trim();
  const name = String(row.clubName ?? clubInfo.name ?? "").trim();

  if (!clubId || !name) {
    return null;
  }

  return {
    clubId,
    name,
    platform: String(row.platform ?? fallbackPlatform),
    currentDivision: numberOrNull(row.currentDivision),
    wins: numberOrNull(row.wins),
    draws: numberOrNull(row.ties),
    losses: numberOrNull(row.losses),
    gamesPlayed: numberOrNull(row.gamesPlayed),
    goalsFor: numberOrNull(row.goals),
    goalsAgainst: numberOrNull(row.goalsAgainst),
  };
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const object = payload as Record<string, unknown>;
  for (const key of ["results", "clubs", "items", "data"]) {
    if (Array.isArray(object[key])) {
      return object[key] as unknown[];
    }
  }

  return [];
}

export async function searchEaClubs(
  clubName: string,
  platform: string,
): Promise<EaClubCandidate[]> {
  const normalizedQuery = normalizeName(clubName);
  const cacheKey = `${platform}:${normalizedQuery}`;
  const cached = searchCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const baseUrl =
    process.env.EA_PROCLUBS_SEARCH_BASE_URL?.trim() ||
    "https://proclubs.ea.com/api/fc/allTimeLeaderboard/search";
  const url = new URL(baseUrl);
  url.searchParams.set("platform", platform);
  url.searchParams.set("clubName", clubName);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const headers: HeadersInit = {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Origin: "https://www.ea.com",
      Pragma: "no-cache",
      Priority: "u=1, i",
      Referer: "https://www.ea.com/",
      "Sec-Ch-Ua": '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
      "Sec-Ch-Ua-Mobile": "?1",
      "Sec-Ch-Ua-Platform": '"Android"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36",
    };

    if (process.env.EA_PROCLUBS_COOKIE) {
      headers.Cookie = process.env.EA_PROCLUBS_COOKIE;
    }

    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 403) {
      throw new EaClubSearchError(
        "EA blocked this server. Try again later or configure an approved EA request relay.",
        "access_denied",
      );
    }
    if (response.status === 429) {
      throw new EaClubSearchError(
        "EA is rate limiting club searches. Wait a few minutes before retrying.",
        "rate_limited",
      );
    }
    if (!response.ok) {
      throw new EaClubSearchError(
        `EA club search failed with HTTP ${response.status}.`,
        "upstream",
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new EaClubSearchError(
        "EA returned a response that was not valid JSON.",
        "malformed",
      );
    }

    const results = extractRows(payload)
      .map((row) => normalizeCandidate(row, platform))
      .filter((row): row is EaClubCandidate => Boolean(row))
      .sort((a, b) => {
        const aExact = normalizeName(a.name) === normalizedQuery ? 1 : 0;
        const bExact = normalizeName(b.name) === normalizedQuery ? 1 : 0;
        return bExact - aExact || a.name.localeCompare(b.name);
      })
      .slice(0, 12);

    searchCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      results,
    });

    return results;
  } catch (error) {
    if (error instanceof EaClubSearchError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new EaClubSearchError(
        "EA club search timed out. No link was changed.",
        "timeout",
      );
    }
    throw new EaClubSearchError(
      "EA club search is temporarily unavailable.",
      "upstream",
    );
  } finally {
    clearTimeout(timeout);
  }
}

import { NextResponse } from "next/server";

import { EaClubSearchError, searchEaClubs } from "@/lib/ea-clubs";
import { issueEaSelectionToken } from "@/lib/ea-selection-token";
import { requireLeagueAccess } from "@/lib/league-access";

type RateBucket = {
  resetAt: number;
  uses: number;
};

const rateBuckets = new Map<string, RateBucket>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;

function consumeRateLimit(key: string) {
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { resetAt: now + RATE_WINDOW_MS, uses: 1 });
    return true;
  }

  if (current.uses >= RATE_LIMIT) {
    return false;
  }

  current.uses += 1;
  return true;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leagueId: string }> },
) {
  const { leagueId } = await params;
  const access = await requireLeagueAccess(leagueId, ["owner", "admin"]);

  if (!access) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!consumeRateLimit(`${leagueId}:${access.discordUserId}`)) {
    return NextResponse.json(
      { error: "Too many EA searches. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body && typeof body === "object" ? body : {};
  const clubName = String(
    (input as Record<string, unknown>).clubName ?? "",
  ).trim();
  const platform = String(
    (input as Record<string, unknown>).platform ?? access.defaultPlatform,
  ).trim();

  if (clubName.length < 3 || clubName.length > 80) {
    return NextResponse.json(
      { error: "Club name must be between 3 and 80 characters." },
      { status: 400 },
    );
  }

  if (!["common-gen5", "common-gen4"].includes(platform)) {
    return NextResponse.json(
      { error: "Unsupported EA platform." },
      { status: 400 },
    );
  }

  try {
    const results = await searchEaClubs(clubName, platform);
    return NextResponse.json({
      results: results.map((candidate) => ({
        ...candidate,
        selectionToken: issueEaSelectionToken(
          leagueId,
          access.discordUserId,
          candidate,
        ),
      })),
    });
  } catch (error) {
    if (error instanceof EaClubSearchError) {
      const status =
        error.code === "rate_limited"
          ? 429
          : error.code === "timeout"
            ? 504
            : 502;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }

    return NextResponse.json(
      { error: "EA club search failed." },
      { status: 502 },
    );
  }
}

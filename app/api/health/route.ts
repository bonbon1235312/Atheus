import { NextResponse } from "next/server";

export function GET() {
  const checks = {
    authSecret: Boolean(
      process.env.AUTH_SECRET?.trim() ||
        process.env.NEXTAUTH_SECRET?.trim(),
    ),
    discordOAuth: Boolean(
      process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET,
    ),
    supabase: Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  };

  return NextResponse.json({
    service: "atheus-league-platform",
    status: Object.values(checks).every(Boolean) ? "ok" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
}

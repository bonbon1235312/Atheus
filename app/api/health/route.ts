import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "atheus-league-platform",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}


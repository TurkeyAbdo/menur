import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60;
const CLEANUP_INTERVAL = 60_000;

const rateMap = new Map<string, { count: number; timestamp: number }>();
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateMap) {
    if (now - entry.timestamp > WINDOW_MS) {
      rateMap.delete(key);
    }
  }
}

export function middleware(request: NextRequest) {
  // Only rate-limit API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  cleanup();

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.timestamp > WINDOW_MS) {
    rateMap.set(ip, { count: 1, timestamp: now });
    return NextResponse.next();
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

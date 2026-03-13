import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ==================== RATE LIMITING ====================

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

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith("/api")) return null;

  cleanup();

  const ip = getIp(request);
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.timestamp > WINDOW_MS) {
    rateMap.set(ip, { count: 1, timestamp: now });
    return null;
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  return null;
}

// ==================== PROXY ====================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never interfere with NextAuth API routes — let NextAuth handle them fully
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Rate limit other API routes
  const rateLimited = checkRateLimit(request);
  if (rateLimited) return rateLimited;

  // Ensure locale cookie exists
  const response = NextResponse.next();
  if (!request.cookies.get("locale")) {
    response.cookies.set("locale", "ar", { path: "/" });
  }

  // Route protection for dashboard and admin
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  }

  // Auth pages: redirect logged-in users (except verify-email and reset-password)
  if (pathname.startsWith("/auth/")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (token) {
      const allowedWhileLoggedIn = ["/auth/verify-email", "/auth/reset-password"];
      const isAllowed = allowedWhileLoggedIn.some((p) => pathname.startsWith(p));

      if (!isAllowed) {
        const redirectUrl = token.role === "ADMIN" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};

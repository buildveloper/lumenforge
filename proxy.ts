import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session-cookie";

/**
 * A cookie gate, not the authorization boundary.
 *
 * Middleware runs before the Node runtime and cannot reach the database, so it
 * only checks whether a session cookie is present and bounces anonymous
 * visitors away from protected paths. The cookie is a lookup key and nothing
 * more: every protected page and action re-validates it against an unexpired
 * session row through `requireUserId()`.
 */
const PUBLIC_PATHS = ["/", "/privacy", "/terms", "/sign-in", "/sign-up"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

// -- In-memory rate limiter (per IP, per window) ------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  if (isPublic(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    // Preserve where they were headed so sign-in can honour it later.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|_next/webpack-hmr|_next/data).*)",
  ],
};

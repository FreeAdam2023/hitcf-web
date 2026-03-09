import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/wrong-answers",
  "/history",
  "/practice/",
  "/exam/",
  "/results/",
  "/vocabulary",
  "/speaking-practice",
  "/speaking-conversation",
  "/writing-practice",
  "/writing-exam",
  "/referral",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Proxy /api/* (except /api/auth/*) to backend
  //    /api/auth/* is handled by NextAuth in Pages Router — do NOT proxy.
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const target = new URL(pathname + request.nextUrl.search, BACKEND_URL);
    return NextResponse.rewrite(target);
  }

  // 2. www → non-www
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.replace("www.", "");
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // 3. i18n routing (locale detection + prefix)
  const response = intlMiddleware(request);

  // 4. Auth protection (skip in dev)
  if (process.env.NODE_ENV !== "development") {
    const localeMatch = pathname.match(/^\/(zh|en|fr|ar)(\/.*)?$/);
    const pathWithoutLocale = localeMatch ? (localeMatch[2] || "/") : pathname;

    if (PROTECTED_PREFIXES.some((p) => pathWithoutLocale.startsWith(p))) {
      const sessionToken =
        request.cookies.get("__Secure-next-auth.session-token") ??
        request.cookies.get("next-auth.session-token");
      if (!sessionToken?.value) {
        const url = request.nextUrl.clone();
        const locale = localeMatch?.[1] || routing.defaultLocale;
        url.pathname = `/${locale}/login`;
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // API routes (except auth and Next.js internals) — proxy to backend
    "/api/((?!auth|_next).*)",
    // All non-API routes except static files — i18n + auth
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};

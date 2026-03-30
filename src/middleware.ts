import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Read at module load (server startup) — picks up Azure App Settings at runtime.
// NOT baked at build time like next.config.mjs rewrites.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID || "";
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET || "";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/wrong-answers",
  "/review",
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

  // ── NextAuth routes: let Next.js handle /api/auth/* directly ──
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // ── API proxy: /api/* → backend ──
  if (pathname.startsWith("/api/")) {
    const host = request.headers.get("host") || "";

    // Environment guard: production host must never use dev backend
    if (
      !host.includes("localhost") &&
      !host.includes("dev") &&
      BACKEND_URL.includes("-dev")
    ) {
      console.error(
        `CRITICAL: Production host "${host}" using dev backend: ${BACKEND_URL}`,
      );
      return new NextResponse(
        JSON.stringify({
          error: "Backend configuration error",
          detail: "Production host using development backend URL",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    const target = new URL(pathname, BACKEND_URL);
    target.search = request.nextUrl.search;

    // Cloudflare Access Service Token for server-to-server auth (dev environment)
    if (CF_ACCESS_CLIENT_ID) {
      const headers = new Headers(request.headers);
      headers.set("CF-Access-Client-Id", CF_ACCESS_CLIENT_ID);
      headers.set("CF-Access-Client-Secret", CF_ACCESS_CLIENT_SECRET);
      return NextResponse.rewrite(target, { request: { headers } });
    }

    return NextResponse.rewrite(target);
  }

  // 1. www → non-www
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.replace("www.", "");
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // 2. i18n routing (locale detection + prefix)
  // URL locale is authoritative — if the path already has a valid locale,
  // block any redirect that would change it (e.g. /zh/tests → /en/tests).
  const urlLocaleMatch = pathname.match(/^\/(zh|en|fr|ar)(\/|$)/);
  const response = intlMiddleware(request);

  if (urlLocaleMatch && response.headers.get("location")) {
    const location = response.headers.get("location")!;
    try {
      const redirectUrl = new URL(location, request.url);
      const redirectLocaleMatch = redirectUrl.pathname.match(/^\/(zh|en|fr|ar)(\/|$)/);
      if (redirectLocaleMatch && redirectLocaleMatch[1] !== urlLocaleMatch[1]) {
        // intlMiddleware is trying to change the locale — block it, serve the requested URL as-is
        return NextResponse.next();
      }
    } catch {
      // invalid URL, let it through
    }
  }

  // 3. Auth protection (skip in dev)
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
  // Removed "api|" from exclusion — middleware now handles /api/* proxy
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};

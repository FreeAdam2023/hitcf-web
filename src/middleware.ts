import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Read at module load (server startup) — picks up Azure App Settings at runtime.
// NOT baked at build time like next.config.mjs rewrites.
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
  const response = intlMiddleware(request);

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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};

import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

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
    const pathname = request.nextUrl.pathname;
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
    // Match all routes except api, static files, Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};

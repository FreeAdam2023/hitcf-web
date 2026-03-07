import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/wrong-answers",
  "/history",
  "/practice/",
  "/exam/",
  "/results/",
];

export function middleware(request: NextRequest) {
  // Dev environment: allow all
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Redirect www → non-www (fixes Google OAuth callback domain mismatch)
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.replace("www.", "");
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for NextAuth session cookie
  const sessionToken =
    request.cookies.get("__Secure-next-auth.session-token") ??
    request.cookies.get("next-auth.session-token");

  if (!sessionToken?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

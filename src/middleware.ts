import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/wrong-answers",
  "/history",
  "/speed-drill",
  "/practice/",
  "/exam/",
  "/results/",
];

export function middleware(request: NextRequest) {
  // Dev environment: allow all
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
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
    "/dashboard/:path*",
    "/wrong-answers/:path*",
    "/history/:path*",
    "/speed-drill/:path*",
    "/practice/:path*",
    "/exam/:path*",
    "/results/:path*",
  ],
};

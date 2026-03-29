import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { headers as getHeaders, cookies as getCookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production";

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstile_token: { label: "Turnstile", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${BACKEND_URL}/api/credential-auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              turnstile_token: credentials.turnstile_token || null,
            }),
          });

          if (!res.ok) return null;

          const user = await res.json();
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Extract tracking data from request context
          let trackingData: Record<string, string> = {};
          try {
            const h = await getHeaders();
            const c = await getCookies();
            // Detect locale: NEXT_LOCALE cookie (most reliable) → referer path → fallback
            const referer = h.get("referer") || "";
            const cookieLocale = c.get("NEXT_LOCALE")?.value || "";
            const refererMatch = referer.match(/\/(?:zh|en|fr|ar)\//);
            const locale = cookieLocale || (refererMatch ? refererMatch[0].replace(/\//g, "") : "");
            trackingData = {
              signup_ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "",
              signup_user_agent: h.get("user-agent") || "",
              signup_referer: referer,
              signup_utm_source: c.get("utm_source")?.value || "",
              signup_utm_medium: c.get("utm_medium")?.value || "",
              signup_utm_campaign: c.get("utm_campaign")?.value || "",
              referral_code: c.get("ref")?.value || "",
              locale,
            };
          } catch {
            // headers()/cookies() may fail outside route handler context
          }

          const res = await fetch(
            `${BACKEND_URL}/api/google-auth/login-or-create`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Internal-Secret": NEXTAUTH_SECRET,
              },
              body: JSON.stringify({
                google_id: account.providerAccountId,
                email: user.email,
                name: user.name,
                ...trackingData,
              }),
            },
          );
          if (!res.ok) return false;
          const backendUser = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const u = user as any;
          u.id = backendUser.id;
          u.role = backendUser.role;
          u.name = backendUser.name;
        } catch {
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Read locale from NEXT_LOCALE cookie (set by next-intl middleware + login/register pages)
      let locale = "en";
      try {
        const c = await getCookies();
        locale = c.get("NEXT_LOCALE")?.value || "en";
      } catch {
        // cookies() may fail outside route handler
      }
      const LOCALES = ["zh", "en", "fr", "ar"];
      if (!LOCALES.includes(locale)) locale = "en";

      // Relative URL → prepend locale if not already present
      if (url.startsWith("/")) {
        const hasLocale = LOCALES.some((l) => url.startsWith(`/${l}/`) || url === `/${l}`);
        const localized = hasLocale ? url : `/${locale}${url}`;
        return `${baseUrl}${localized}`;
      }

      // Absolute URL on same domain → ensure locale prefix
      if (url.startsWith(baseUrl)) {
        const path = url.slice(baseUrl.length);
        const hasLocale = LOCALES.some((l) => path.startsWith(`/${l}/`) || path === `/${l}`);
        if (!hasLocale) return `${baseUrl}/${locale}${path || "/tests"}`;
        return url;
      }

      return `${baseUrl}/${locale}/tests`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: string }).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  jwt: {
    encode: async ({ token, secret }) => {
      if (!token) return "";
      return jwt.sign(token as object, secret as string, { algorithm: "HS256" });
    },
    decode: async ({ token, secret }) => {
      if (!token) return null;
      try {
        return jwt.verify(token, secret as string, {
          algorithms: ["HS256"],
        }) as ReturnType<typeof jwt.verify> & Record<string, unknown>;
      } catch {
        return null;
      }
    },
  },
};

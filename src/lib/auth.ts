import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

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

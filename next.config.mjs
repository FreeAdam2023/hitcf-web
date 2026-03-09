import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      // fallback: runs AFTER all routes (including App Router) are checked,
      // but BEFORE 404. This ensures NextAuth /api/auth/* routes are handled
      // by the App Router route handler first, and only unmatched /api/*
      // requests are proxied to the backend.
      // The middleware matcher already excludes /api from locale processing,
      // so [locale] won't capture /api/* requests.
      fallback: [
        {
          source: "/api/:path*",
          destination: `${process.env.BACKEND_URL || "http://localhost:8001"}/api/:path*`,
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);

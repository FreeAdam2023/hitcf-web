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
      // afterFiles: runs after filesystem routes but before dynamic routes.
      // Rules are matched in order — first match wins.
      afterFiles: [
        // 1) NextAuth: identity rewrite keeps /api/auth/* local (App Router)
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*",
        },
        // 2) All other /api/* routes proxy to the backend
        {
          source: "/api/:path*",
          destination: `${process.env.BACKEND_URL || "http://localhost:8001"}/api/:path*`,
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);

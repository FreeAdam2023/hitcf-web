import type { MetadataRoute } from "next";

const DISALLOW_COMMON = ["/api/"];

// Authenticated / stateful routes — locale-prefixed
const DISALLOW_AUTH = [
  "/*/exam/",
  "/*/practice/",
  "/*/results/",
  "/*/writing-exam/",
  "/*/writing-practice/",
  "/*/speaking-practice/results/",
  "/*/speaking-conversation/results/",
  "/*/history",
  "/*/review",
  "/*/dashboard",
  "/*/checkin",
  "/*/account",
  "/*/profile",
  "/*/payment/",
  "/*/login",
  "/*/register",
  "/*/forgot-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // General crawlers (Googlebot, Bingbot, etc.)
      {
        userAgent: "*",
        allow: "/",
        disallow: [...DISALLOW_COMMON, ...DISALLOW_AUTH],
      },
      // AI crawlers — explicitly allowed for GEO visibility
      ...[
        "GPTBot",
        "OAI-SearchBot",
        "ChatGPT-User",
        "ClaudeBot",
        "Claude-SearchBot",
        "Claude-User",
        "anthropic-ai",
        "PerplexityBot",
        "Perplexity-User",
        "Google-Extended",
        "Applebot-Extended",
        "CCBot",
        "Bytespider",
      ].map((ua) => ({
        userAgent: ua,
        allow: "/" as const,
        disallow: DISALLOW_COMMON,
      })),
    ],
    sitemap: "https://hitcf.com/sitemap.xml",
  };
}

import type { MetadataRoute } from "next";

const SITE_URL = "https://www.hitcf.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core pages ──
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tests`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // ── Feature pages (public-facing) ──
    {
      url: `${SITE_URL}/speaking-practice`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/speaking-conversation`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/speed-drill`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // ── User dashboard pages ──
    {
      url: `${SITE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/wrong-answers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/history`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    // ── Vocabulary ──
    {
      url: `${SITE_URL}/vocabulary`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/vocabulary/my-saved`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/vocabulary/nihao-french`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // ── Resources ──
    {
      url: `${SITE_URL}/resources`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // ── Legal ──
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}

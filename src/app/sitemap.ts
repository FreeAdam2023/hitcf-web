import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";

const SITE_URL = "https://hitcf.com";
const LOCALES = ["zh", "en", "fr", "ar"];

function localizedEntries(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number },
): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]),
      ),
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Core pages
    ...localizedEntries("", { changeFrequency: "weekly", priority: 1 }),
    ...localizedEntries("/tests", { changeFrequency: "weekly", priority: 0.9 }),
    ...localizedEntries("/pricing", { changeFrequency: "monthly", priority: 0.8 }),
    // Feature pages
    ...localizedEntries("/speaking-practice", { changeFrequency: "weekly", priority: 0.8 }),
    ...localizedEntries("/speaking-conversation", { changeFrequency: "weekly", priority: 0.8 }),
    ...localizedEntries("/speaking-exam", { changeFrequency: "weekly", priority: 0.8 }),
    ...localizedEntries("/speaking-scripts", { changeFrequency: "monthly", priority: 0.7 }),
    ...localizedEntries("/writing-mock-exam", { changeFrequency: "weekly", priority: 0.8 }),
    ...localizedEntries("/seat-monitor", { changeFrequency: "daily", priority: 0.7 }),
    ...localizedEntries("/review", { changeFrequency: "daily", priority: 0.6 }),
    ...localizedEntries("/history", { changeFrequency: "daily", priority: 0.5 }),
    // Vocabulary
    ...localizedEntries("/vocabulary", { changeFrequency: "weekly", priority: 0.8 }),
    ...localizedEntries("/vocabulary/my-saved", { changeFrequency: "daily", priority: 0.6 }),
    ...localizedEntries("/vocabulary/nihao-french", { changeFrequency: "monthly", priority: 0.7 }),
    ...localizedEntries("/vocabulary/theme-words", { changeFrequency: "monthly", priority: 0.7 }),
    // Reference
    ...localizedEntries("/reference", { changeFrequency: "monthly", priority: 0.7 }),
    // Referral
    ...localizedEntries("/referral", { changeFrequency: "monthly", priority: 0.5 }),
    // Guide pages
    ...localizedEntries("/guide", { changeFrequency: "monthly", priority: 0.7 }),
    ...localizedEntries("/guide/tcf-canada", { changeFrequency: "monthly", priority: 0.8 }),
    ...localizedEntries("/guide/clb-7", { changeFrequency: "monthly", priority: 0.8 }),
    ...localizedEntries("/guide/tcf-listening", { changeFrequency: "monthly", priority: 0.8 }),
    ...localizedEntries("/guide/tcf-reading", { changeFrequency: "monthly", priority: 0.8 }),
    ...localizedEntries("/guide/tcf-speaking", { changeFrequency: "monthly", priority: 0.8 }),
    ...localizedEntries("/guide/tcf-writing", { changeFrequency: "monthly", priority: 0.8 }),
    ...localizedEntries("/guide/tcf-score-chart", { changeFrequency: "monthly", priority: 0.9 }),
    // Blog
    ...localizedEntries("/blog", { changeFrequency: "weekly", priority: 0.7 }),
    ...getAllSlugs().flatMap((slug) =>
      localizedEntries(`/blog/${slug}`, { changeFrequency: "monthly", priority: 0.6 }),
    ),
    // Resources
    ...localizedEntries("/resources", { changeFrequency: "monthly", priority: 0.6 }),
    // Legal
    ...localizedEntries("/terms-of-service", { changeFrequency: "yearly", priority: 0.3 }),
    ...localizedEntries("/privacy-policy", { changeFrequency: "yearly", priority: 0.3 }),
    ...localizedEntries("/refund-policy", { changeFrequency: "yearly", priority: 0.3 }),
    ...localizedEntries("/disclaimer", { changeFrequency: "yearly", priority: 0.3 }),
  ];
}

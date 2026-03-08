import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();

  it("should generate entries for all 4 locales per page", () => {
    // The home page should have 4 entries (one per locale)
    const homeEntries = entries.filter((e) => /hitcf\.com\/(zh|en|fr|ar)$/.test(e.url));
    expect(homeEntries).toHaveLength(4);
  });

  it("should include locale prefix in all URLs", () => {
    for (const entry of entries) {
      expect(entry.url).toMatch(/hitcf\.com\/(zh|en|fr|ar)(\/|$)/);
    }
  });

  it("should include alternates for each entry", () => {
    for (const entry of entries) {
      const alt = (entry as { alternates?: { languages?: Record<string, string> } }).alternates;
      expect(alt?.languages).toBeDefined();
      expect(Object.keys(alt!.languages!)).toEqual(
        expect.arrayContaining(["zh", "en", "fr", "ar"]),
      );
    }
  });

  it("should generate /tests entries with correct priority", () => {
    const testsEntries = entries.filter((e) => e.url.endsWith("/tests"));
    expect(testsEntries).toHaveLength(4);
    for (const e of testsEntries) {
      expect(e.priority).toBe(0.9);
    }
  });

  it("should include vocabulary pages", () => {
    const vocabEntries = entries.filter((e) => e.url.includes("/vocabulary"));
    // 3 vocab paths × 4 locales = 12
    expect(vocabEntries.length).toBeGreaterThanOrEqual(12);
  });

  it("should include legal pages", () => {
    const legalPaths = ["/terms-of-service", "/privacy-policy", "/refund-policy", "/disclaimer"];
    for (const path of legalPaths) {
      const legalEntries = entries.filter((e) => e.url.includes(path));
      expect(legalEntries).toHaveLength(4);
    }
  });

  it("should have correct total count", () => {
    // 15 unique paths × 4 locales = 60
    expect(entries).toHaveLength(60);
  });
});

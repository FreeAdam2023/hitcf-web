import { describe, it, expect } from "vitest";
import { MOTIVATION_QUOTES } from "./motivation-quotes";

describe("MOTIVATION_QUOTES", () => {
  it("has at least 30 quotes for good rotation", () => {
    expect(MOTIVATION_QUOTES.length).toBeGreaterThanOrEqual(30);
  });

  it("every quote has non-empty fr and author fields", () => {
    for (const q of MOTIVATION_QUOTES) {
      expect(q.fr).toBeTruthy();
      expect(q.author).toBeTruthy();
      expect(q.fr.length).toBeGreaterThan(5);
    }
  });

  it("has no duplicate quotes", () => {
    const set = new Set(MOTIVATION_QUOTES.map((q) => q.fr));
    expect(set.size).toBe(MOTIVATION_QUOTES.length);
  });
});

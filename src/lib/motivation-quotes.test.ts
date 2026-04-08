import { describe, it, expect } from "vitest";
import { MOTIVATION_QUOTES } from "./motivation-quotes";

describe("MOTIVATION_QUOTES", () => {
  it("has at least 30 quotes for good rotation", () => {
    expect(MOTIVATION_QUOTES.length).toBeGreaterThanOrEqual(30);
  });

  it("every quote has all required fields", () => {
    for (const q of MOTIVATION_QUOTES) {
      expect(q.fr).toBeTruthy();
      expect(q.zh).toBeTruthy();
      expect(q.en).toBeTruthy();
      expect(q.ar).toBeTruthy();
      expect(q.author).toBeTruthy();
    }
  });

  it("has no duplicate French quotes", () => {
    const set = new Set(MOTIVATION_QUOTES.map((q) => q.fr));
    expect(set.size).toBe(MOTIVATION_QUOTES.length);
  });
});

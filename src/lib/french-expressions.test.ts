import { describe, it, expect } from "vitest";
import {
  FRENCH_EXPRESSIONS,
  EXPRESSION_CATEGORIES,
  EXPRESSION_LEVELS,
  getExpressionByIndex,
} from "./french-expressions";

describe("FRENCH_EXPRESSIONS", () => {
  it("has at least 60 expressions for good rotation", () => {
    expect(FRENCH_EXPRESSIONS.length).toBeGreaterThanOrEqual(60);
  });

  it("every expression has all required fields", () => {
    for (const e of FRENCH_EXPRESSIONS) {
      expect(e.id).toBeTruthy();
      expect(e.fr).toBeTruthy();
      expect(e.phonetic).toBeTruthy();
      expect(EXPRESSION_CATEGORIES).toContain(e.category);
      expect(EXPRESSION_LEVELS).toContain(e.level);
      expect(e.meaning.zh).toBeTruthy();
      expect(e.meaning.en).toBeTruthy();
      expect(e.meaning.fr).toBeTruthy();
      expect(e.meaning.ar).toBeTruthy();
      expect(e.example_fr).toBeTruthy();
      expect(e.example_translation.zh).toBeTruthy();
      expect(e.example_translation.en).toBeTruthy();
      expect(e.example_translation.ar).toBeTruthy();
      expect(e.usage_tip.zh).toBeTruthy();
      expect(e.usage_tip.en).toBeTruthy();
      expect(e.usage_tip.ar).toBeTruthy();
      expect(e.tags.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate ids", () => {
    const ids = new Set(FRENCH_EXPRESSIONS.map((e) => e.id));
    expect(ids.size).toBe(FRENCH_EXPRESSIONS.length);
  });

  it("has no duplicate French expressions", () => {
    const frs = new Set(FRENCH_EXPRESSIONS.map((e) => e.fr));
    expect(frs.size).toBe(FRENCH_EXPRESSIONS.length);
  });

  it("covers all categories", () => {
    const cats = new Set(FRENCH_EXPRESSIONS.map((e) => e.category));
    for (const cat of EXPRESSION_CATEGORIES) {
      expect(cats.has(cat)).toBe(true);
    }
  });

  it("covers multiple levels", () => {
    const levels = new Set(FRENCH_EXPRESSIONS.map((e) => e.level));
    expect(levels.size).toBeGreaterThanOrEqual(3);
  });

  it("getExpressionByIndex wraps around correctly", () => {
    const len = FRENCH_EXPRESSIONS.length;
    expect(getExpressionByIndex(0)).toBe(FRENCH_EXPRESSIONS[0]);
    expect(getExpressionByIndex(len)).toBe(FRENCH_EXPRESSIONS[0]);
    expect(getExpressionByIndex(-1)).toBe(FRENCH_EXPRESSIONS[len - 1]);
  });
});

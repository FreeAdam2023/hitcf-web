import { describe, it, expect } from "vitest";
import zhMessages from "./messages/zh.json";
import enMessages from "./messages/en.json";
import frMessages from "./messages/fr.json";
import arMessages from "./messages/ar.json";

function findDottedKeys(obj: Record<string, unknown>, path = ""): string[] {
  const results: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (key.includes(".")) {
      results.push(fullPath);
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      results.push(...findDottedKeys(value as Record<string, unknown>, fullPath));
    }
  }
  return results;
}

describe("message files — no dotted keys", () => {
  // next-intl v4 disallows dots in message keys (dots = nesting separator)
  it("zh.json should have no dotted keys", () => {
    expect(findDottedKeys(zhMessages)).toEqual([]);
  });

  it("en.json should have no dotted keys", () => {
    expect(findDottedKeys(enMessages)).toEqual([]);
  });

  it("fr.json should have no dotted keys", () => {
    expect(findDottedKeys(frMessages)).toEqual([]);
  });

  it("ar.json should have no dotted keys", () => {
    expect(findDottedKeys(arMessages)).toEqual([]);
  });
});

describe("message files — structure consistency", () => {
  it("all locales should have the same top-level keys", () => {
    const zhKeys = Object.keys(zhMessages).sort();
    const enKeys = Object.keys(enMessages).sort();
    const frKeys = Object.keys(frMessages).sort();
    const arKeys = Object.keys(arMessages).sort();

    expect(enKeys).toEqual(zhKeys);
    expect(frKeys).toEqual(zhKeys);
    expect(arKeys).toEqual(zhKeys);
  });
});

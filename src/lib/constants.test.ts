import { describe, it, expect } from "vitest";
import { PRICING, formatPrice } from "./constants";

describe("PRICING constants", () => {
  it("should have correct base prices", () => {
    expect(PRICING.monthly).toBe(19.9);
    expect(PRICING.quarterly).toBe(49.9);
    expect(PRICING.yearly).toBe(99.9);
  });

  it("should compute quarterlyPerMonth correctly", () => {
    // 49.9 / 3 = 16.6333... → 16.63
    expect(PRICING.quarterlyPerMonth).toBe(16.63);
  });

  it("should compute yearlyPerMonth correctly", () => {
    // 99.9 / 12 = 8.325 → 8.33
    expect(PRICING.yearlyPerMonth).toBe(8.33);
  });

  it("should compute quarterlySavePercent correctly", () => {
    // round((1 - 49.9 / (19.9 * 3)) * 100) = round((1 - 49.9/59.7) * 100)
    // = round(16.415...) = 16
    expect(PRICING.quarterlySavePercent).toBe(16);
  });

  it("should compute yearlySavePercent correctly", () => {
    // round((1 - 99.9 / (19.9 * 12)) * 100) = round((1 - 99.9/238.8) * 100)
    // = round(58.163...) = 58
    expect(PRICING.yearlySavePercent).toBe(58);
  });

  it("should have correct trial days", () => {
    expect(PRICING.monthlyTrialDays).toBe(7);
    expect(PRICING.quarterlyTrialDays).toBe(7);
    expect(PRICING.yearlyTrialDays).toBe(14);
  });

  it("should have USD currency", () => {
    expect(PRICING.currency).toBe("USD");
  });
});

describe("formatPrice", () => {
  it("should format with default prefix", () => {
    expect(formatPrice(19.9)).toBe("US$19.90");
  });

  it("should format with custom prefix", () => {
    expect(formatPrice(49.9, "$")).toBe("$49.90");
  });

  it("should format whole numbers with .00", () => {
    expect(formatPrice(100)).toBe("US$100.00");
  });
});

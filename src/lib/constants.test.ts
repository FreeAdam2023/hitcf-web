import { describe, it, expect } from "vitest";
import { PRICING, formatPrice } from "./constants";

describe("PRICING constants", () => {
  it("should have correct base prices", () => {
    expect(PRICING.monthly).toBe(19.9);
    expect(PRICING.quarterly).toBe(49.9);
    expect(PRICING.semiannual).toBe(69.9);
  });

  it("should compute quarterlyPerMonth correctly", () => {
    // 49.9 / 3 = 16.6333... → 16.63
    expect(PRICING.quarterlyPerMonth).toBe(16.63);
  });

  it("should compute semiannualPerMonth correctly", () => {
    // 69.9 / 6 = 11.65
    expect(PRICING.semiannualPerMonth).toBe(11.65);
  });

  it("should compute quarterlySavePercent correctly", () => {
    // round((1 - 49.9 / (19.9 * 3)) * 100) = round((1 - 49.9/59.7) * 100)
    // = round(16.415...) = 16
    expect(PRICING.quarterlySavePercent).toBe(16);
  });

  it("should compute semiannualSavePercent correctly", () => {
    // round((1 - 69.9 / (19.9 * 6)) * 100) = round((1 - 69.9/119.4) * 100)
    // = round(41.458...) = 41
    expect(PRICING.semiannualSavePercent).toBe(41);
  });

  it("should have correct trial days", () => {
    expect(PRICING.monthlyTrialDays).toBe(3);
    expect(PRICING.quarterlyTrialDays).toBe(3);
    expect(PRICING.semiannualTrialDays).toBe(3);
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

import { describe, it, expect, vi, afterEach } from "vitest";
import { getPhaseMessage, getDaysUntil, getCancelDeadline, EXAM_CENTERS, CITY_OPTIONS } from "./countdown";

describe("getPhaseMessage", () => {
  it("returns phaseRelax for >60 days", () => {
    expect(getPhaseMessage(90)).toBe("phaseRelax");
    expect(getPhaseMessage(61)).toBe("phaseRelax");
  });

  it("returns phaseSteady for 31-60 days", () => {
    expect(getPhaseMessage(60)).toBe("phaseSteady");
    expect(getPhaseMessage(31)).toBe("phaseSteady");
  });

  it("returns phaseSprint for 15-30 days", () => {
    expect(getPhaseMessage(30)).toBe("phaseSprint");
    expect(getPhaseMessage(15)).toBe("phaseSprint");
  });

  it("returns phaseFinal for 8-14 days", () => {
    expect(getPhaseMessage(14)).toBe("phaseFinal");
    expect(getPhaseMessage(8)).toBe("phaseFinal");
  });

  it("returns phaseReady for 1-7 days", () => {
    expect(getPhaseMessage(7)).toBe("phaseReady");
    expect(getPhaseMessage(1)).toBe("phaseReady");
  });

  it("returns phaseToday for 0 days", () => {
    expect(getPhaseMessage(0)).toBe("phaseToday");
  });

  it("returns phasePast for negative days", () => {
    expect(getPhaseMessage(-1)).toBe("phasePast");
    expect(getPhaseMessage(-30)).toBe("phasePast");
  });
});

describe("getDaysUntil", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for today", () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(getDaysUntil(dateStr)).toBe(0);
  });

  it("returns positive for future date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 3)); // April 3, 2026
    expect(getDaysUntil("2026-06-30")).toBe(88);
    vi.useRealTimers();
  });

  it("returns negative for past date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 1)); // July 1, 2026
    expect(getDaysUntil("2026-06-30")).toBe(-1);
    vi.useRealTimers();
  });
});

describe("getCancelDeadline", () => {
  it("returns 14 days before exam date", () => {
    expect(getCancelDeadline("2026-06-30")).toBe("2026-06-16");
  });

  it("handles month boundary", () => {
    expect(getCancelDeadline("2026-07-10")).toBe("2026-06-26");
  });

  it("handles year boundary", () => {
    expect(getCancelDeadline("2027-01-10")).toBe("2026-12-27");
  });
});

describe("EXAM_CENTERS", () => {
  it("has all 9 cities", () => {
    expect(Object.keys(EXAM_CENTERS)).toHaveLength(9);
    for (const city of CITY_OPTIONS) {
      expect(EXAM_CENTERS[city]).toBeDefined();
      expect(EXAM_CENTERS[city].address).toBeTruthy();
      expect(EXAM_CENTERS[city].mapsUrl).toMatch(/^https:\/\/maps\.google\.com/);
      expect(EXAM_CENTERS[city].registrationUrl).toMatch(/^https:\/\//);
    }
  });
});

describe("CITY_OPTIONS", () => {
  it("contains exactly 9 cities matching EXAM_CENTERS keys", () => {
    expect(CITY_OPTIONS).toHaveLength(9);
    for (const city of CITY_OPTIONS) {
      expect(EXAM_CENTERS[city]).toBeDefined();
    }
  });
});

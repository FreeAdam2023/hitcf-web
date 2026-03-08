import { describe, it, expect } from "vitest";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_LABELS } from "./locales";

describe("i18n locales", () => {
  it("should support zh, en, fr, ar", () => {
    expect(SUPPORTED_LOCALES).toEqual(["zh", "en", "fr", "ar"]);
  });

  it("should default to en", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("should have labels for all locales", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
    }
  });

  it("should have correct label values", () => {
    expect(LOCALE_LABELS.zh).toBe("中文");
    expect(LOCALE_LABELS.en).toBe("English");
    expect(LOCALE_LABELS.fr).toBe("Français");
    expect(LOCALE_LABELS.ar).toBe("العربية");
  });
});

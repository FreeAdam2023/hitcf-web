import { describe, it, expect } from "vitest";
import { routing } from "./routing";

describe("i18n routing config", () => {
  it("should define 4 supported locales", () => {
    expect(routing.locales).toEqual(["zh", "en", "fr", "ar"]);
  });

  it("should use en as default locale", () => {
    expect(routing.defaultLocale).toBe("en");
  });

  it("should always include locale prefix in URLs", () => {
    expect(routing.localePrefix).toBe("always");
  });

  it("should use NEXT_LOCALE cookie", () => {
    expect(routing.localeCookie).toEqual({ name: "NEXT_LOCALE", maxAge: 365 * 24 * 60 * 60 });
  });

  it("should enable locale detection", () => {
    expect(routing.localeDetection).toBe(true);
  });
});

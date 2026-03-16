import { describe, it, expect } from "vitest";

// Test the pure logic extracted from middleware (locale stripping + route matching)
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/wrong-answers",
  "/review",
  "/history",
  "/practice/",
  "/exam/",
  "/results/",
];

function stripLocale(pathname: string): { locale: string | null; path: string } {
  const match = pathname.match(/^\/(zh|en|fr|ar)(\/.*)?$/);
  if (match) {
    return { locale: match[1], path: match[2] || "/" };
  }
  return { locale: null, path: pathname };
}

function isProtected(pathname: string): boolean {
  const { path } = stripLocale(pathname);
  return PROTECTED_PREFIXES.some((p) => path.startsWith(p));
}

describe("middleware locale stripping", () => {
  it("should strip zh locale prefix", () => {
    expect(stripLocale("/zh/tests")).toEqual({ locale: "zh", path: "/tests" });
  });

  it("should strip en locale prefix", () => {
    expect(stripLocale("/en/pricing")).toEqual({ locale: "en", path: "/pricing" });
  });

  it("should strip fr locale prefix", () => {
    expect(stripLocale("/fr/vocabulary/my-saved")).toEqual({
      locale: "fr",
      path: "/vocabulary/my-saved",
    });
  });

  it("should strip ar locale prefix", () => {
    expect(stripLocale("/ar")).toEqual({ locale: "ar", path: "/" });
  });

  it("should not strip non-locale prefix", () => {
    expect(stripLocale("/tests")).toEqual({ locale: null, path: "/tests" });
  });

  it("should not strip invalid locale", () => {
    expect(stripLocale("/de/tests")).toEqual({ locale: null, path: "/de/tests" });
  });
});

describe("middleware route protection", () => {
  it("should protect /zh/practice/abc", () => {
    expect(isProtected("/zh/practice/abc")).toBe(true);
  });

  it("should protect /en/exam/123", () => {
    expect(isProtected("/en/exam/123")).toBe(true);
  });

  it("should protect /fr/results/456", () => {
    expect(isProtected("/fr/results/456")).toBe(true);
  });

  it("should protect /ar/dashboard", () => {
    expect(isProtected("/ar/dashboard")).toBe(true);
  });

  it("should protect /zh/wrong-answers", () => {
    expect(isProtected("/zh/wrong-answers")).toBe(true);
  });

  it("should protect /en/review", () => {
    expect(isProtected("/en/review")).toBe(true);
  });

  it("should protect /en/history", () => {
    expect(isProtected("/en/history")).toBe(true);
  });

  it("should NOT protect /zh/tests", () => {
    expect(isProtected("/zh/tests")).toBe(false);
  });

  it("should NOT protect /en/pricing", () => {
    expect(isProtected("/en/pricing")).toBe(false);
  });

  it("should NOT protect /fr", () => {
    expect(isProtected("/fr")).toBe(false);
  });

  it("should NOT protect /zh/login", () => {
    expect(isProtected("/zh/login")).toBe(false);
  });

  it("should NOT protect /ar/vocabulary", () => {
    expect(isProtected("/ar/vocabulary")).toBe(false);
  });
});

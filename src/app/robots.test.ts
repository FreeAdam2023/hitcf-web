import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  const config = robots();

  it("should allow root", () => {
    expect(config.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ allow: "/" }),
      ]),
    );
  });

  it("should disallow api routes", () => {
    const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    expect(rule.disallow).toContain("/api/");
  });

  it("should disallow locale-prefixed practice/exam/results", () => {
    const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    expect(rule.disallow).toContain("/*/practice/");
    expect(rule.disallow).toContain("/*/exam/");
    expect(rule.disallow).toContain("/*/results/");
  });

  it("should include sitemap URL", () => {
    expect(config.sitemap).toBe("https://hitcf.com/sitemap.xml");
  });
});

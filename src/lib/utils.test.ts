import { describe, it, expect } from "vitest";
import { cn, formatTime } from "./utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("should merge conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("", "")).toBe("");
  });
});

describe("formatTime", () => {
  it("should format 0 seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("should format seconds only", () => {
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(59)).toBe("0:59");
  });

  it("should format minutes and seconds", () => {
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(90)).toBe("1:30");
    expect(formatTime(125)).toBe("2:05");
  });

  it("should handle large values", () => {
    expect(formatTime(3600)).toBe("60:00");
    expect(formatTime(3661)).toBe("61:01");
  });
});

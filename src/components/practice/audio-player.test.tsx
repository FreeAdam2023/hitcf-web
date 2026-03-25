import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { AudioPlayer, type AudioPlayerHandle } from "./audio-player";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock media API
vi.mock("@/lib/api/media", () => ({
  getAudioUrl: vi.fn().mockResolvedValue({ url: "https://example.com/audio.mp3" }),
}));

// Mock utils
vi.mock("@/lib/utils", () => ({
  formatTime: (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`,
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

describe("AudioPlayer", () => {
  it("exposes replay method via ref", () => {
    const ref = createRef<AudioPlayerHandle>();
    render(<AudioPlayer ref={ref} questionId="q1" />);
    // The ref should be populated with the imperative handle
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.replay).toBe("function");
    expect(typeof ref.current?.seekTo).toBe("function");
    expect(typeof ref.current?.playSegment).toBe("function");
  });
});

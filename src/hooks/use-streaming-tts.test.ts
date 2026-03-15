import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStreamingTTS } from "./use-streaming-tts";

// Mock the speech SDK and API to prevent real network calls
vi.mock("@/lib/api/speech", () => ({
  getSpeechToken: vi.fn().mockResolvedValue({ token: "test-token", region: "canadacentral" }),
}));

vi.mock("microsoft-cognitiveservices-speech-sdk", () => ({
  SpeechConfig: {
    fromAuthorizationToken: vi.fn().mockReturnValue({
      speechSynthesisVoiceName: "",
    }),
  },
  SpeakerAudioDestination: vi.fn().mockImplementation(() => ({
    onAudioEnd: null,
    isClosed: true,
    close: vi.fn(),
  })),
  AudioConfig: {
    fromSpeakerOutput: vi.fn().mockReturnValue({}),
  },
  SpeechSynthesizer: vi.fn().mockImplementation(() => ({
    speakTextAsync: vi.fn((_text, onResult) => {
      onResult({ reason: 1 });
    }),
    close: vi.fn(),
  })),
  ResultReason: { SynthesizingAudioCompleted: 1 },
}));

describe("useStreamingTTS", () => {
  it("should initialize with isSpeaking=false", () => {
    const { result } = renderHook(() => useStreamingTTS());
    expect(result.current.isSpeaking).toBe(false);
  });

  it("should expose feedChunk, finalize, and stop methods", () => {
    const { result } = renderHook(() => useStreamingTTS());
    expect(typeof result.current.feedChunk).toBe("function");
    expect(typeof result.current.finalize).toBe("function");
    expect(typeof result.current.stop).toBe("function");
  });

  it("feedChunk should not crash with empty text", () => {
    const { result } = renderHook(() => useStreamingTTS());
    act(() => {
      result.current.feedChunk("");
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it("stop should reset isSpeaking to false", () => {
    const { result } = renderHook(() => useStreamingTTS());
    act(() => {
      result.current.feedChunk("Some text. ");
    });
    act(() => {
      result.current.stop();
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it("finalize after stop should not crash", () => {
    const { result } = renderHook(() => useStreamingTTS());
    act(() => {
      result.current.stop();
      result.current.finalize();
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it("multiple stops should be safe", () => {
    const { result } = renderHook(() => useStreamingTTS());
    act(() => {
      result.current.stop();
      result.current.stop();
      result.current.stop();
    });
    expect(result.current.isSpeaking).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationWS } from "./use-conversation-ws";

// Mock getWSToken
vi.mock("@/lib/api/speaking-conversation", () => ({
  getWSToken: vi.fn().mockResolvedValue({
    token: "test-jwt-token",
    ws_url: "ws://localhost:8001/api/speaking-conversation/ws",
  }),
}));

// ── Mock WebSocket ──────────────────────────────────────────────────

let mockWsInstance: {
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  readyState: number;
  onopen: ((ev: Event) => void) | null;
  onmessage: ((ev: MessageEvent) => void) | null;
  onclose: ((ev: CloseEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
};

class MockWebSocket {
  static readonly OPEN = 1;
  static readonly CLOSED = 3;

  send = vi.fn();
  close = vi.fn();
  readyState = 1; // OPEN
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    mockWsInstance = this;
    // Auto-trigger onopen in next tick
    setTimeout(() => {
      this.onopen?.(new Event("open"));
    }, 0);
  }
}

const OriginalWebSocket = global.WebSocket;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.WebSocket = MockWebSocket as any;
});

afterEach(() => {
  vi.useRealTimers();
  global.WebSocket = OriginalWebSocket;
});

function simulateServerMessage(data: Record<string, unknown>) {
  mockWsInstance?.onmessage?.(
    new MessageEvent("message", { data: JSON.stringify(data) }),
  );
}

describe("useConversationWS", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useConversationWS({}),
    );
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamingText).toBe("");
    expect(result.current.connectionFailed).toBe(false);
  });

  it("should connect and authenticate", async () => {
    const { result } = renderHook(() =>
      useConversationWS({}),
    );

    await act(async () => {
      await result.current.connect();
    });

    // Wait for onopen + auth message
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });

    // Should have sent auth message
    expect(mockWsInstance.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "auth", token: "test-jwt-token" }),
    );

    // Simulate auth_ok
    act(() => {
      simulateServerMessage({ type: "auth_ok", user_id: "user-1" });
    });

    expect(result.current.isConnected).toBe(true);
  });

  it("should set connectionFailed on auth_error", async () => {
    const { result } = renderHook(() =>
      useConversationWS({}),
    );

    await act(async () => {
      await result.current.connect();
      await vi.advanceTimersByTimeAsync(10);
    });

    act(() => {
      simulateServerMessage({ type: "auth_error", detail: "Token expired" });
    });

    expect(result.current.connectionFailed).toBe(true);
  });

  it("sendBegin should send begin message with session_id", async () => {
    const { result } = renderHook(() =>
      useConversationWS({}),
    );

    await act(async () => {
      await result.current.connect();
      await vi.advanceTimersByTimeAsync(10);
    });

    act(() => {
      simulateServerMessage({ type: "auth_ok", user_id: "user-1" });
    });

    act(() => {
      result.current.sendBegin("session-123");
    });

    expect(mockWsInstance.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "begin", session_id: "session-123" }),
    );
  });

  it("should accumulate streamingText on stream_delta", async () => {
    const onStreamDelta = vi.fn();
    const onStreamEnd = vi.fn();

    const { result } = renderHook(() =>
      useConversationWS({ onStreamDelta, onStreamEnd }),
    );

    await act(async () => {
      await result.current.connect();
      await vi.advanceTimersByTimeAsync(10);
    });

    act(() => {
      simulateServerMessage({ type: "auth_ok", user_id: "user-1" });
    });

    act(() => {
      simulateServerMessage({ type: "stream_start" });
    });
    expect(result.current.isStreaming).toBe(true);

    act(() => {
      simulateServerMessage({ type: "stream_delta", text: "Bonjour" });
    });
    expect(result.current.streamingText).toBe("Bonjour");
    expect(onStreamDelta).toHaveBeenCalledWith("Bonjour");

    act(() => {
      simulateServerMessage({ type: "stream_delta", text: " madame." });
    });
    expect(result.current.streamingText).toBe("Bonjour madame.");

    act(() => {
      simulateServerMessage({
        type: "stream_end",
        full_text: "Bonjour madame.",
        turn_count: 1,
      });
    });
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamingText).toBe("");
    expect(onStreamEnd).toHaveBeenCalledWith("Bonjour madame.", 1);
  });

  it("sendTurn should send turn message", async () => {
    const { result } = renderHook(() =>
      useConversationWS({}),
    );

    await act(async () => {
      await result.current.connect();
      await vi.advanceTimersByTimeAsync(10);
    });

    act(() => {
      simulateServerMessage({ type: "auth_ok", user_id: "user-1" });
    });

    act(() => {
      result.current.sendTurn({
        user_text: "Je voudrais un compte.",
        pronunciation_scores: { accuracy: 85 },
        word_scores: [{ word: "compte", accuracy: 90, errorType: "None" }],
      });
    });

    expect(mockWsInstance.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "turn",
        user_text: "Je voudrais un compte.",
        pronunciation_scores: { accuracy: 85 },
        word_scores: [{ word: "compte", accuracy: 90, errorType: "None" }],
      }),
    );
  });

  it("sendEnd should send end message", async () => {
    const { result } = renderHook(() =>
      useConversationWS({}),
    );

    await act(async () => {
      await result.current.connect();
      await vi.advanceTimersByTimeAsync(10);
    });

    act(() => {
      simulateServerMessage({ type: "auth_ok", user_id: "user-1" });
    });

    act(() => {
      result.current.sendEnd("zh");
    });

    expect(mockWsInstance.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "end", locale: "zh" }),
    );
  });

  it("should call onEnded and onEvaluationDone callbacks", async () => {
    const onEnded = vi.fn();
    const onEvaluationDone = vi.fn();

    const { result } = renderHook(() =>
      useConversationWS({ onEnded, onEvaluationDone }),
    );

    await act(async () => {
      await result.current.connect();
      await vi.advanceTimersByTimeAsync(10);
    });

    act(() => {
      simulateServerMessage({ type: "auth_ok", user_id: "user-1" });
    });

    act(() => {
      simulateServerMessage({ type: "ended" });
    });
    expect(onEnded).toHaveBeenCalled();

    act(() => {
      simulateServerMessage({ type: "evaluation_done" });
    });
    expect(onEvaluationDone).toHaveBeenCalled();
  });

  it("should call onError for error messages", async () => {
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useConversationWS({ onError }),
    );

    await act(async () => {
      await result.current.connect();
      await vi.advanceTimersByTimeAsync(10);
    });

    act(() => {
      simulateServerMessage({ type: "auth_ok", user_id: "user-1" });
    });

    act(() => {
      simulateServerMessage({
        type: "error",
        code: "TURN_FAILED",
        detail: "AI service timed out",
      });
    });

    expect(onError).toHaveBeenCalledWith("TURN_FAILED", "AI service timed out");
    expect(result.current.isStreaming).toBe(false);
  });

  it("disconnect should close WS and reset state", async () => {
    const { result } = renderHook(() =>
      useConversationWS({}),
    );

    await act(async () => {
      await result.current.connect();
      await vi.advanceTimersByTimeAsync(10);
    });

    act(() => {
      simulateServerMessage({ type: "auth_ok", user_id: "user-1" });
    });

    expect(result.current.isConnected).toBe(true);

    act(() => {
      result.current.disconnect();
    });

    expect(mockWsInstance.close).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isStreaming).toBe(false);
  });
});

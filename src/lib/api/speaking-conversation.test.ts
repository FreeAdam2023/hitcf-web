import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  startConversation,
  beginConversation,
  sendTurn,
  endConversation,
  getConversation,
  getWSToken,
  deleteConversation,
} from "./speaking-conversation";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("speaking-conversation API", () => {
  it("startConversation should POST to /start", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "sess-1", status: "pending" }),
    });

    const result = await startConversation({
      test_set_id: "ts-1",
      question_id: "q-1",
    });
    expect(result).toEqual({ id: "sess-1", status: "pending" });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/speaking-conversation/start");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      test_set_id: "ts-1",
      question_id: "q-1",
    });
  });

  it("beginConversation should POST with 60s timeout", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ examiner_text: "Bonjour!", turn_count: 1 }),
    });

    const result = await beginConversation("sess-1");
    expect(result.examiner_text).toBe("Bonjour!");
    expect(result.turn_count).toBe(1);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/speaking-conversation/sess-1/begin");
  });

  it("sendTurn should POST user text and scores", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ examiner_text: "D'accord.", turn_count: 3 }),
    });

    const result = await sendTurn("sess-1", {
      user_text: "Je voudrais un compte.",
      pronunciation_scores: { accuracy: 85, fluency: 80 },
      word_scores: [{ word: "compte", accuracy: 90, errorType: "None" }],
    });
    expect(result.examiner_text).toBe("D'accord.");

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.user_text).toBe("Je voudrais un compte.");
    expect(body.pronunciation_scores.accuracy).toBe(85);
  });

  it("endConversation should POST with 120s timeout", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ id: "sess-1", status: "completed", evaluation: {} }),
    });

    const result = await endConversation("sess-1", "zh");
    expect(result.status).toBe("completed");

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/speaking-conversation/sess-1/end");
    expect(JSON.parse(init.body)).toEqual({ locale: "zh" });
  });

  it("getConversation should GET session by ID", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ id: "sess-1", status: "active", turns: [] }),
    });

    const result = await getConversation("sess-1");
    expect(result.id).toBe("sess-1");

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/speaking-conversation/sess-1");
    expect(init.method).toBeUndefined(); // GET has no explicit method
  });

  it("deleteConversation should send DELETE", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });

    const result = await deleteConversation("sess-1");
    expect(result.ok).toBe(true);

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe("DELETE");
  });

  it("getWSToken should POST to /ws-token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          token: "eyJhbGciOiJIUzI1NiJ9.test",
          ws_url: "ws://localhost:8001/api/speaking-conversation/ws",
        }),
    });

    const result = await getWSToken();
    expect(result.token).toContain("eyJ");
    expect(result.ws_url).toContain("/api/speaking-conversation/ws");

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/speaking-conversation/ws-token");
    expect(init.method).toBe("POST");
  });
});

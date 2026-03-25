import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  startSpeedDrill,
  fetchDrillNav,
  loadDrillQuestion,
  resumeSpeedDrill,
  getInProgressDrills,
  abandonSpeedDrill,
  fetchLevelStats,
} from "./speed-drill";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("startSpeedDrill", () => {
  it("calls POST /api/speed-drill/next with default params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ attempt_id: "abc123", total: 10 }),
    });

    const result = await startSpeedDrill({ type: "listening", count: 10 });
    expect(result.attempt_id).toBe("abc123");
    expect(result.total).toBe(10);

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/speed-drill/next");
    expect(url).toContain("type=listening");
    expect(url).toContain("count=10");
    expect(opts.method).toBe("POST");
  });

  it("appends levels as repeated params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ attempt_id: "abc", total: 5 }),
    });

    await startSpeedDrill({ type: "listening", levels: ["A1", "B1"], count: 5 });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("levels=A1");
    expect(url).toContain("levels=B1");
  });

  it("sets dedup=false when dedup is false", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ attempt_id: "abc", total: 5 }),
    });

    await startSpeedDrill({ type: "listening", dedup: false });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("dedup=false");
  });

  it("sets include_done=true when specified", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ attempt_id: "abc", total: 5 }),
    });

    await startSpeedDrill({ type: "listening", include_done: true });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("include_done=true");
  });

  it("omits optional params when not provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ attempt_id: "abc", total: 5 }),
    });

    await startSpeedDrill({});
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/speed-drill/next");
  });
});

describe("fetchDrillNav", () => {
  const navResponse = {
    attempt_id: "att123",
    total: 30,
    page: 1,
    page_size: 50,
    total_pages: 1,
    question_ids: ["q1", "q2", "q3"],
    answered_ids: ["q1"],
    answered_count: 1,
  };

  it("calls GET with correct URL and default pagination", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(navResponse),
    });

    const result = await fetchDrillNav("att123");
    expect(result.total).toBe(30);
    expect(result.question_ids).toEqual(["q1", "q2", "q3"]);
    expect(result.answered_ids).toEqual(["q1"]);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/speed-drill/att123/nav?page=1&page_size=50");
  });

  it("passes custom page and pageSize", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ...navResponse, page: 2 }),
    });

    await fetchDrillNav("att123", 2, 100);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/speed-drill/att123/nav?page=2&page_size=100");
  });
});

describe("loadDrillQuestion", () => {
  const questionResponse = {
    id: "q1",
    type: "listening",
    level: "A1",
    question_number: 1,
    question_text: "Test question",
    options: [{ key: "A", text: "Correct" }],
    bookmarked: false,
    answered: false,
  };

  it("calls GET with correct URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(questionResponse),
    });

    const result = await loadDrillQuestion("q1", "att123");
    expect(result.id).toBe("q1");
    expect(result.bookmarked).toBe(false);
    expect(result.answered).toBe(false);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/speed-drill/question/q1?attempt_id=att123");
  });

  it("returns answered question with selected answer", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          ...questionResponse,
          answered: true,
          selected: "A",
          is_correct: true,
          correct_answer: "A",
        }),
    });

    const result = await loadDrillQuestion("q1", "att123");
    expect(result.answered).toBe(true);
    expect(result.selected).toBe("A");
    expect(result.is_correct).toBe(true);
  });
});

describe("resumeSpeedDrill", () => {
  it("calls GET /api/speed-drill/resume/{id}", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ attempt_id: "att123", total: 30, answered_count: 5 }),
    });

    const result = await resumeSpeedDrill("att123");
    expect(result.attempt_id).toBe("att123");
    expect(result.total).toBe(30);
    expect(result.answered_count).toBe(5);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/speed-drill/resume/att123");
  });
});

describe("getInProgressDrills", () => {
  it("calls GET /api/speed-drill/in-progress", async () => {
    const items = [
      {
        attempt_id: "att1",
        total: 10,
        answered_count: 3,
        started_at: "2026-03-24T10:00:00Z",
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(items),
    });

    const result = await getInProgressDrills();
    expect(result).toHaveLength(1);
    expect(result[0].attempt_id).toBe("att1");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/speed-drill/in-progress");
  });

  it("returns empty array when no drills", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const result = await getInProgressDrills();
    expect(result).toEqual([]);
  });
});

describe("abandonSpeedDrill", () => {
  it("calls POST /api/speed-drill/abandon/{id}", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: "abandoned" }),
    });

    await abandonSpeedDrill("att123");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/speed-drill/abandon/att123");
    expect(opts.method).toBe("POST");
  });
});

describe("fetchLevelStats", () => {
  it("calls GET /api/speed-drill/level-stats with type", async () => {
    const stats = {
      type: "listening",
      levels: {
        A1: { total: 50, raw_total: 55, completed: 10 },
        B1: { total: 40, raw_total: 42, completed: 5 },
      },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(stats),
    });

    const result = await fetchLevelStats("listening");
    expect(result.type).toBe("listening");
    expect(result.levels.A1.total).toBe(50);
    expect(result.levels.A1.completed).toBe(10);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/speed-drill/level-stats?type=listening");
  });

  it("works for reading type", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          type: "reading",
          levels: { B2: { total: 30, raw_total: 32, completed: 0 } },
        }),
    });

    const result = await fetchLevelStats("reading");
    expect(result.type).toBe("reading");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/speed-drill/level-stats?type=reading");
  });
});

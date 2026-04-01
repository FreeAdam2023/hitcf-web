import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createHighlight,
  getHighlightsForQuestion,
  listHighlights,
  updateHighlight,
  deleteHighlight,
} from "./highlights";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

const MOCK_HIGHLIGHT = {
  id: "hl1",
  question_id: "q1",
  text: "le gouvernement",
  sentence_index: 0,
  start_offset: 0,
  end_offset: 15,
  color: "yellow",
  note: null,
  created_at: "2026-04-01T00:00:00Z",
};

describe("createHighlight", () => {
  it("should POST to /api/highlights", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(MOCK_HIGHLIGHT),
    });

    const result = await createHighlight({
      question_id: "q1",
      text: "le gouvernement",
      start_offset: 0,
      end_offset: 15,
    });
    expect(result).toEqual(MOCK_HIGHLIGHT);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/highlights",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String),
      }),
    );
  });
});

describe("getHighlightsForQuestion", () => {
  it("should GET with question_id query param", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([MOCK_HIGHLIGHT]),
    });

    const result = await getHighlightsForQuestion("q1");
    expect(result).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/highlights?question_id=q1",
      expect.any(Object),
    );
  });
});

describe("listHighlights", () => {
  it("should GET /api/highlights/list with filters", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          items: [MOCK_HIGHLIGHT],
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        }),
    });

    const result = await listHighlights({ has_note: true, type: "reading" });
    expect(result.total).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/highlights/list?"),
      expect.any(Object),
    );
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("has_note=true");
    expect(url).toContain("type=reading");
  });

  it("should GET /api/highlights/list without filters", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          items: [],
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
        }),
    });

    const result = await listHighlights();
    expect(result.items).toEqual([]);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/highlights/list",
      expect.any(Object),
    );
  });
});

describe("updateHighlight", () => {
  it("should PATCH with note", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "hl1", color: "yellow", note: "my note" }),
    });

    const result = await updateHighlight("hl1", { note: "my note" });
    expect(result.note).toBe("my note");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/highlights/hl1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ note: "my note" }),
      }),
    );
  });
});

describe("deleteHighlight", () => {
  it("should DELETE highlight", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ message: "Highlight deleted" }),
    });

    const result = await deleteHighlight("hl1");
    expect(result.message).toBe("Highlight deleted");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/highlights/hl1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listAttempts,
  createAttempt,
  createMockExam,
  checkMockFreeTrialEligible,
} from "./attempts";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("attempts API client", () => {
  it("listAttempts calls GET /api/attempts with pagination", async () => {
    const payload = {
      items: [{ id: "a1", status: "in_progress" }],
      total: 1,
      page: 1,
      page_size: 20,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(payload),
    });

    const result = await listAttempts({ page: 1, page_size: 20 });
    expect(result.items).toHaveLength(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/attempts");
    expect(url).toContain("page=1");
  });

  it("createAttempt calls POST /api/attempts", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "a1",
          status: "in_progress",
          mode: "practice",
          test_set_id: "ts1",
        }),
    });

    const result = await createAttempt({
      test_set_id: "ts1",
      mode: "practice",
    });
    expect(result.id).toBe("a1");
    expect(result.mode).toBe("practice");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/attempts");
    expect(opts.method).toBe("POST");
  });

  it("createMockExam calls POST /api/mock-exam", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ id: "m1", status: "in_progress", is_mock_exam: true }),
    });

    const result = await createMockExam(["listening", "reading"]);
    expect(result.id).toBe("m1");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/mock-exam");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({
      types: ["listening", "reading"],
    });
  });

  it("checkMockFreeTrialEligible calls GET /api/mock-exam/free-trial", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ eligible: true }),
    });

    const result = await checkMockFreeTrialEligible();
    expect(result.eligible).toBe(true);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/mock-exam/free-trial");
  });

  it("checkMockFreeTrialEligible returns false after use", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ eligible: false }),
    });

    const result = await checkMockFreeTrialEligible();
    expect(result.eligible).toBe(false);
  });

  it("createMockExam handles 403 (subscription required)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () =>
        Promise.resolve({ detail: "Active subscription required" }),
    });

    await expect(
      createMockExam(["listening"]),
    ).rejects.toThrow();
  });
});

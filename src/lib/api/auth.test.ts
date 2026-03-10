import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMe, updateProfile, setExamDate, changePassword } from "./auth";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("auth API client", () => {
  it("fetchMe calls GET /api/user/me", async () => {
    const user = {
      id: "u1",
      email: "test@hitcf.com",
      name: "Test",
      role: "user",
      ui_language: "zh",
      subscription: { plan: null, status: null },
      exam_date: null,
      watermark_visible: false,
      created_at: "2026-01-01T00:00:00",
      last_login_at: null,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(user),
    });

    const result = await fetchMe();
    expect(result.email).toBe("test@hitcf.com");
    expect(result.exam_date).toBeNull();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/user/me");
  });

  it("fetchMe includes exam_date when set", async () => {
    const user = {
      id: "u1",
      email: "test@hitcf.com",
      name: "Test",
      role: "user",
      ui_language: "zh",
      subscription: { plan: "monthly", status: "active" },
      exam_date: "2026-06-15",
      watermark_visible: false,
      created_at: "2026-01-01T00:00:00",
      last_login_at: null,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(user),
    });

    const result = await fetchMe();
    expect(result.exam_date).toBe("2026-06-15");
  });

  it("updateProfile calls PUT /api/user/me", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ message: "ok", name: "New", ui_language: "en" }),
    });

    const result = await updateProfile({ name: "New" });
    expect(result.name).toBe("New");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/user/me");
    expect(opts.method).toBe("PUT");
  });

  it("setExamDate calls PUT /api/user/exam-date with date", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ exam_date: "2026-06-15" }),
    });

    const result = await setExamDate("2026-06-15");
    expect(result.exam_date).toBe("2026-06-15");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/user/exam-date");
    expect(opts.method).toBe("PUT");
    expect(JSON.parse(opts.body)).toEqual({ exam_date: "2026-06-15" });
  });

  it("setExamDate calls PUT with null to clear", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ exam_date: null }),
    });

    const result = await setExamDate(null);
    expect(result.exam_date).toBeNull();
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      exam_date: null,
    });
  });

  it("changePassword calls PUT /api/user/password", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ message: "Password changed" }),
    });

    const result = await changePassword({
      current_password: "old",
      new_password: "newpass123",
    });
    expect(result.message).toBe("Password changed");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/user/password");
    expect(opts.method).toBe("PUT");
  });

  it("fetchMe handles 401 without redirect when noRedirect", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: "Not authenticated" }),
    });

    await expect(fetchMe()).rejects.toThrow();
  });
});

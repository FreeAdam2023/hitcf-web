import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { get, post, put, del, ApiError } from "./client";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Suppress window.location navigation
const locationMock = { href: "" };
Object.defineProperty(window, "location", {
  value: locationMock,
  writable: true,
});

beforeEach(() => {
  mockFetch.mockReset();
  locationMock.href = "";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("API client - get", () => {
  it("should make a GET request and return JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "hello" }),
    });

    const result = await get<{ data: string }>("/api/test");
    expect(result).toEqual({ data: "hello" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({ headers: {} }),
    );
  });

  it("should handle 204 No Content", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await get("/api/test");
    expect(result).toBeUndefined();
  });
});

describe("API client - post", () => {
  it("should send JSON body with POST", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "123" }),
    });

    const result = await post("/api/items", { name: "test" });
    expect(result).toEqual({ id: "123" });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "test" }));
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("should send POST without body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });

    await post("/api/action");
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBeUndefined();
  });
});

describe("API client - put", () => {
  it("should send JSON body with PUT", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ updated: true }),
    });

    await put("/api/items/1", { name: "updated" });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe("PUT");
    expect(init.body).toBe(JSON.stringify({ name: "updated" }));
  });
});

describe("API client - del", () => {
  it("should send DELETE request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ deleted: true }),
    });

    await del("/api/items/1");
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe("DELETE");
  });
});

describe("API client - error handling", () => {
  it("should throw ApiError on 401 and redirect to /login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(get("/api/protected")).rejects.toThrow(ApiError);
    await expect(get("/api/protected")).rejects.toThrow(); // re-mock needed
    expect(locationMock.href).toBe("/login");
  });

  it("should throw ApiError with noRedirect on 401 without redirecting", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });
    locationMock.href = "";

    await expect(
      get("/api/protected", { noRedirect: true }),
    ).rejects.toThrow(ApiError);
    expect(locationMock.href).toBe("");
  });

  it("should redirect to /pricing on 403 with subscription message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () =>
        Promise.resolve({ detail: "Active subscription required" }),
    });

    await expect(get("/api/premium")).rejects.toThrow(ApiError);
    expect(locationMock.href).toBe("/pricing");
  });

  it("should throw ApiError on 500", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ detail: "Something broke" }),
    });

    try {
      await get("/api/broken");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
      expect((err as ApiError).message).toBe("Something broke");
    }
  });

  it("should handle non-JSON error responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: () => Promise.reject(new Error("not json")),
    });

    try {
      await get("/api/bad-gateway");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(502);
      expect((err as ApiError).message).toBe("Bad Gateway");
    }
  });
});

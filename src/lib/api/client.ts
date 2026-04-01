import { getLocalePath } from "@/lib/utils";

const DEFAULT_TIMEOUT_MS = 30_000;

/** Debounced error reporter — sends client errors to backend for monitoring */
const _errorQueue: Array<{ path: string; method: string; status: number; message: string; ts: number }> = [];
let _flushTimer: ReturnType<typeof setTimeout> | null = null;

function _reportError(path: string, method: string, status: number, message: string) {
  if (typeof window === "undefined") return;
  _errorQueue.push({ path, method, status, message, ts: Date.now() });
  // Debounce: flush after 2 seconds of quiet
  if (_flushTimer) clearTimeout(_flushTimer);
  _flushTimer = setTimeout(_flushErrors, 2000);
}

function _flushErrors() {
  if (_errorQueue.length === 0) return;
  const errors = _errorQueue.splice(0, 20); // max 20 per batch
  // Fire-and-forget POST to backend
  fetch("/api/client-errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ errors, userAgent: navigator.userAgent }),
  }).catch(() => {}); // ignore if this also fails
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class QuotaExceededError extends ApiError {
  constructor(
    public code: "QUESTION_QUOTA_EXCEEDED" | "EXPLANATION_QUOTA_EXCEEDED",
    message: string,
    public used: number,
    public limit: number,
  ) {
    super(429, message);
    this.name = "QuotaExceededError";
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  /** When true, 401 responses throw without redirecting to /login */
  noRedirect?: boolean;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  extra?: RequestOptions,
): Promise<T> {
  const timeoutMs = extra?.timeout ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();

  // Merge external signal if provided
  const externalSignal = extra?.signal ?? options.signal;

  // eslint-disable-next-line prefer-const -- timer must be declared before external signal listener can reference it
  let timer: ReturnType<typeof setTimeout>;

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", () => {
        clearTimeout(timer);
        controller.abort(externalSignal.reason);
      }, { once: true });
    }
  }

  timer = setTimeout(() => controller.abort("Request timeout"), timeoutMs);

  try {
    const defaultHeaders: HeadersInit = options.body
      ? { "Content-Type": "application/json", ...options.headers }
      : { ...options.headers };

    const res = await fetch(path, {
      ...options,
      headers: defaultHeaders,
      signal: controller.signal,
      cache: "no-store",
    });

    if (res.status === 401) {
      if (!extra?.noRedirect && typeof window !== "undefined") {
        window.location.href = getLocalePath("/login");
      }
      throw new ApiError(401, "Unauthorized");
    }

    if (res.status === 403) {
      const body = await res.json().catch(() => ({ detail: "Forbidden" }));
      if (typeof body.detail === "string" && typeof window !== "undefined") {
        if (body.detail === "TRIAL_AI_BLOCKED" || body.detail.includes("subscription")) {
          window.location.href = getLocalePath("/pricing");
        }
      }
      throw new ApiError(403, body.detail || "Forbidden");
    }

    if (res.status === 429) {
      const body = await res.json().catch(() => ({ detail: "Too many requests" }));
      const detail = body.detail;
      // Quota exceeded — throw typed error so components can show inline modal
      if (
        typeof detail === "object" &&
        detail !== null &&
        (detail.code === "QUESTION_QUOTA_EXCEEDED" || detail.code === "EXPLANATION_QUOTA_EXCEEDED")
      ) {
        throw new QuotaExceededError(
          detail.code,
          detail.message || "Daily limit reached",
          detail.used ?? 0,
          detail.limit ?? 0,
        );
      }
      const message =
        typeof detail === "string"
          ? detail
          : detail?.message || "Too many requests";
      throw new ApiError(429, message);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      const err = new ApiError(res.status, body.detail || res.statusText);
      // Report unexpected errors to backend (skip auth/quota which are handled)
      if (res.status >= 500 || (res.status >= 400 && ![401, 403, 429].includes(res.status))) {
        _reportError(path, options.method || "GET", res.status, err.message);
      }
      throw err;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (e) {
    // Network errors (status 0) are user-side — don't report
    if (e instanceof ApiError) throw e;
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function get<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, {}, options);
}

export function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  }, options);
}

export function put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  }, options);
}

export function patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  }, options);
}

export function del<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { method: "DELETE" }, options);
}

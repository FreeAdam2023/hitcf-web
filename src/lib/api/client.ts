import { getLocalePath } from "@/lib/utils";

const DEFAULT_TIMEOUT_MS = 30_000;

/** Track consecutive network failures to detect deployment/downtime */
let _networkFailCount = 0;
let _upgradeToastShown = false;

function _handleNetworkError() {
  _networkFailCount++;
  if (_networkFailCount >= 3 && !_upgradeToastShown) {
    _upgradeToastShown = true;
    // Dynamic import to avoid circular deps
    import("sonner").then(({ toast }) => {
      toast.info(
        typeof window !== "undefined" && document.documentElement.lang?.startsWith("zh")
          ? "系统正在升级，请稍后刷新页面"
          : "System is updating, please refresh in a moment",
        { duration: 15000, id: "system-upgrade" },
      );
    }).catch(() => {});
  }
}

function _resetNetworkFailCount() {
  _networkFailCount = 0;
  _upgradeToastShown = false;
}

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

export type QuotaCode =
  | "QUESTION_QUOTA_EXCEEDED"
  | "EXPLANATION_QUOTA_EXCEEDED"
  | "TRIAL_SPEAKING_QUOTA"
  | "TRIAL_WRITING_QUOTA";

export class QuotaExceededError extends ApiError {
  constructor(
    public code: QuotaCode,
    message: string,
    public used: number,
    public limit: number,
    public feature?: string,
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
  _retryCount = 0,
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

    // Successful fetch — reset network fail counter
    _resetNetworkFailCount();

    if (res.status === 401) {
      if (!extra?.noRedirect && typeof window !== "undefined") {
        window.location.href = getLocalePath("/login");
      }
      throw new ApiError(401, "Unauthorized");
    }

    if (res.status === 403) {
      const body = await res.json().catch(() => ({ detail: "Forbidden" }));
      if (typeof body.detail === "string" && typeof window !== "undefined") {
        if (body.detail.includes("subscription")) {
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
        typeof detail.code === "string" &&
        (detail.code.endsWith("_QUOTA") || detail.code.endsWith("_EXCEEDED"))
      ) {
        throw new QuotaExceededError(
          detail.code,
          detail.message || "Daily limit reached",
          detail.used ?? 0,
          detail.limit ?? 0,
          detail.feature,
        );
      }
      const message =
        typeof detail === "string"
          ? detail
          : detail?.message || "Too many requests";
      throw new ApiError(429, message);
    }

    // Auto-retry once on 502/503 (deployment restart)
    if ((res.status === 502 || res.status === 503) && _retryCount < 1) {
      await new Promise((r) => setTimeout(r, 2000));
      return request<T>(path, options, extra, _retryCount + 1);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      const err = new ApiError(res.status, body.detail || res.statusText);
      if (res.status >= 500 || (res.status >= 400 && ![401, 403, 429].includes(res.status))) {
        _reportError(path, options.method || "GET", res.status, err.message);
      }
      throw err;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (e) {
    // Network errors (status 0) — show upgrade toast after 3 consecutive failures
    if (!(e instanceof ApiError)) {
      _handleNetworkError();
    }
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

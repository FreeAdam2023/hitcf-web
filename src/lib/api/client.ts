const DEFAULT_TIMEOUT_MS = 30_000;

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
        window.location.href = "/login";
      }
      throw new ApiError(401, "Unauthorized");
    }

    if (res.status === 403) {
      const body = await res.json().catch(() => ({ detail: "Forbidden" }));
      if (
        typeof body.detail === "string" &&
        body.detail.includes("subscription") &&
        typeof window !== "undefined"
      ) {
        window.location.href = "/pricing";
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
      throw new ApiError(res.status, body.detail || res.statusText);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
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

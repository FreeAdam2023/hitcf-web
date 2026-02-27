import { get, post, put } from "./client";
import type { RequestOptions } from "./client";
import type {
  WritingAttemptResponse,
  WritingAttemptResults,
} from "./types";

export function createWritingAttempt(
  body: { test_set_id: string; mode: string },
  options?: RequestOptions & { forceNew?: boolean },
): Promise<WritingAttemptResponse> {
  const url = options?.forceNew
    ? "/api/writing-attempts?force_new=true"
    : "/api/writing-attempts";
  return post<WritingAttemptResponse>(url, body, options);
}

export function getActiveWritingAttempt(
  testSetId: string,
  mode: string,
  options?: RequestOptions,
): Promise<WritingAttemptResponse | null> {
  return get<WritingAttemptResponse | null>(
    `/api/writing-attempts/active?test_set_id=${testSetId}&mode=${mode}`,
    options,
  );
}

export function getWritingAttempt(
  attemptId: string,
  options?: RequestOptions,
): Promise<WritingAttemptResponse> {
  return get<WritingAttemptResponse>(
    `/api/writing-attempts/${attemptId}`,
    options,
  );
}

export function saveWritingEssays(
  attemptId: string,
  essays: Record<string, { text: string; word_count: number }>,
  options?: RequestOptions,
): Promise<WritingAttemptResponse> {
  return put<WritingAttemptResponse>(
    `/api/writing-attempts/${attemptId}/save`,
    { essays },
    { ...options, timeout: 10_000 },
  );
}

export function completeWritingAttempt(
  attemptId: string,
  options?: RequestOptions,
): Promise<WritingAttemptResults> {
  return post<WritingAttemptResults>(
    `/api/writing-attempts/${attemptId}/complete`,
    undefined,
    { ...options, timeout: 120_000 },
  );
}

export function getWritingAttemptResults(
  attemptId: string,
  options?: RequestOptions,
): Promise<WritingAttemptResults> {
  return get<WritingAttemptResults>(
    `/api/writing-attempts/${attemptId}/results`,
    options,
  );
}

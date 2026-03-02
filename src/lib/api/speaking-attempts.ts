import { get, post, put } from "./client";
import type { RequestOptions } from "./client";
import type { SpeakingAttemptResponse, PaginatedResponse } from "./types";

export function createSpeakingAttempt(
  body: { test_set_id: string; question_id: string; mode: string },
  options?: RequestOptions & { forceNew?: boolean },
): Promise<SpeakingAttemptResponse> {
  const url = options?.forceNew
    ? "/api/speaking-attempts?force_new=true"
    : "/api/speaking-attempts";
  return post<SpeakingAttemptResponse>(url, body, options);
}

export function saveSpeakingResult(
  attemptId: string,
  body: {
    transcript: string;
    duration_seconds: number;
    scores: Record<string, number> | null;
    word_scores: Array<{ word: string; accuracy: number; errorType: string }>;
  },
  options?: RequestOptions,
): Promise<SpeakingAttemptResponse> {
  return put<SpeakingAttemptResponse>(
    `/api/speaking-attempts/${attemptId}/save`,
    body,
    options,
  );
}

export function completeSpeakingAttempt(
  attemptId: string,
  options?: RequestOptions,
): Promise<SpeakingAttemptResponse> {
  return post<SpeakingAttemptResponse>(
    `/api/speaking-attempts/${attemptId}/complete`,
    undefined,
    options,
  );
}

export function getSpeakingAttempt(
  attemptId: string,
  options?: RequestOptions,
): Promise<SpeakingAttemptResponse> {
  return get<SpeakingAttemptResponse>(
    `/api/speaking-attempts/${attemptId}`,
    options,
  );
}

export function listSpeakingAttempts(
  params?: {
    page?: number;
    page_size?: number;
    question_id?: string;
    test_set_id?: string;
  },
  options?: RequestOptions,
): Promise<PaginatedResponse<SpeakingAttemptResponse>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  if (params?.question_id) searchParams.set("question_id", params.question_id);
  if (params?.test_set_id) searchParams.set("test_set_id", params.test_set_id);
  const qs = searchParams.toString();
  return get<PaginatedResponse<SpeakingAttemptResponse>>(
    `/api/speaking-attempts${qs ? `?${qs}` : ""}`,
    options,
  );
}

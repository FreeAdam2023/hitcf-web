import { get, post, put } from "./client";
import type { RequestOptions } from "./client";
import type {
  ActiveAttemptResponse,
  CreateAttemptRequest,
  CreateAttemptResponse,
  SubmitAnswerRequest,
  AnswerResponse,
  CompleteAttemptResponse,
  AttemptDetail,
  AttemptReview,
  AttemptResponse,
  PaginatedResponse,
} from "./types";

export function getActiveAttempt(
  testSetId: string,
  mode: string = "practice",
  options?: RequestOptions,
): Promise<ActiveAttemptResponse | null> {
  return get<ActiveAttemptResponse | null>(
    `/api/attempts/active?test_set_id=${testSetId}&mode=${mode}`,
    options,
  );
}

export function createAttempt(
  body: CreateAttemptRequest,
  options?: RequestOptions & { forceNew?: boolean },
): Promise<CreateAttemptResponse> {
  const url = options?.forceNew
    ? "/api/attempts?force_new=true"
    : "/api/attempts";
  return post<CreateAttemptResponse>(url, body, options);
}

export function submitAnswer(
  attemptId: string,
  body: SubmitAnswerRequest,
  options?: RequestOptions,
): Promise<AnswerResponse> {
  return put<AnswerResponse>(`/api/attempts/${attemptId}/answer`, body, options);
}

export function flagQuestion(
  attemptId: string,
  questionNumber: number,
  options?: RequestOptions,
): Promise<{ flagged_questions: number[] }> {
  return put<{ flagged_questions: number[] }>(
    `/api/attempts/${attemptId}/flag/${questionNumber}`,
    undefined,
    options,
  );
}

export function completeAttempt(
  attemptId: string,
  options?: RequestOptions,
): Promise<CompleteAttemptResponse> {
  return post<CompleteAttemptResponse>(`/api/attempts/${attemptId}/complete`, undefined, options);
}

export function getAttempt(attemptId: string, options?: RequestOptions): Promise<AttemptDetail> {
  return get<AttemptDetail>(`/api/attempts/${attemptId}`, options);
}

export function getAttemptReview(attemptId: string, options?: RequestOptions): Promise<AttemptReview> {
  return get<AttemptReview>(`/api/attempts/${attemptId}/review`, options);
}

export function listAttempts(params?: {
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AttemptResponse>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get<PaginatedResponse<AttemptResponse>>(
    `/api/attempts${qs ? `?${qs}` : ""}`,
  );
}

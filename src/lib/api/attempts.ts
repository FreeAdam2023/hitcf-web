import { get, post, put } from "./client";
import type {
  CreateAttemptRequest,
  CreateAttemptResponse,
  SubmitAnswerRequest,
  AnswerResponse,
  CompleteAttemptResponse,
  AttemptDetail,
  AttemptResponse,
  PaginatedResponse,
} from "./types";

export function createAttempt(
  body: CreateAttemptRequest,
): Promise<CreateAttemptResponse> {
  return post<CreateAttemptResponse>("/api/attempts", body);
}

export function submitAnswer(
  attemptId: string,
  body: SubmitAnswerRequest,
): Promise<AnswerResponse> {
  return put<AnswerResponse>(`/api/attempts/${attemptId}/answer`, body);
}

export function flagQuestion(
  attemptId: string,
  questionNumber: number,
): Promise<{ flagged_questions: number[] }> {
  return put<{ flagged_questions: number[] }>(
    `/api/attempts/${attemptId}/flag/${questionNumber}`,
  );
}

export function completeAttempt(
  attemptId: string,
): Promise<CompleteAttemptResponse> {
  return post<CompleteAttemptResponse>(`/api/attempts/${attemptId}/complete`);
}

export function getAttempt(attemptId: string): Promise<AttemptDetail> {
  return get<AttemptDetail>(`/api/attempts/${attemptId}`);
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

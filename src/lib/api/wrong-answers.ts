import { get, post, put, del } from "./client";
import type { PaginatedResponse, WrongAnswerItem, WrongAnswerStats, WrongAnswerDetail } from "./types";

export function listWrongAnswers(params?: {
  type?: string;
  level?: string;
  is_mastered?: boolean;
  sort_by?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<WrongAnswerItem>> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.level) searchParams.set("level", params.level);
  if (params?.is_mastered !== undefined)
    searchParams.set("is_mastered", String(params.is_mastered));
  if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get<PaginatedResponse<WrongAnswerItem>>(
    `/api/wrong-answers${qs ? `?${qs}` : ""}`,
  );
}

export function getWrongAnswerStats(): Promise<WrongAnswerStats> {
  return get<WrongAnswerStats>("/api/wrong-answers/stats");
}

export function getWrongAnswerDetail(id: string): Promise<WrongAnswerDetail> {
  return get<WrongAnswerDetail>(`/api/wrong-answers/${id}/detail`);
}

export function toggleMastered(
  id: string,
): Promise<{ id: string; is_mastered: boolean }> {
  return put<{ id: string; is_mastered: boolean }>(
    `/api/wrong-answers/${id}/master`,
  );
}

export interface PracticeWrongAnswersResponse {
  attempt_id: string;
  total: number;
}

export function deleteWrongAnswer(id: string): Promise<{ ok: boolean }> {
  return del(`/api/wrong-answers/${id}`);
}

export function batchDeleteWrongAnswers(ids: string[]): Promise<{ deleted: number }> {
  return post("/api/wrong-answers/batch-delete", { ids });
}

export function clearMasteredWrongAnswers(): Promise<{ deleted: number }> {
  return post("/api/wrong-answers/clear-mastered", {});
}

export function practiceWrongAnswers(body: {
  type?: string;
  levels?: string[];
  limit?: number;
}): Promise<PracticeWrongAnswersResponse> {
  return post<PracticeWrongAnswersResponse>("/api/wrong-answers/practice", body);
}

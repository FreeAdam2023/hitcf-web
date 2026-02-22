import { get, post, put } from "./client";
import type { PaginatedResponse, WrongAnswerItem } from "./types";

export function listWrongAnswers(params?: {
  type?: string;
  level?: string;
  is_mastered?: boolean;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<WrongAnswerItem>> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.level) searchParams.set("level", params.level);
  if (params?.is_mastered !== undefined)
    searchParams.set("is_mastered", String(params.is_mastered));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get<PaginatedResponse<WrongAnswerItem>>(
    `/api/wrong-answers${qs ? `?${qs}` : ""}`,
  );
}

export function toggleMastered(
  id: string,
): Promise<{ id: string; is_mastered: boolean }> {
  return put<{ id: string; is_mastered: boolean }>(
    `/api/wrong-answers/${id}/master`,
  );
}

export interface PracticeWrongAnswersResponse {
  id: string;
  test_set_id: string;
  mode: string;
  total: number;
  status: string;
  question_ids: string[];
}

export function practiceWrongAnswers(body: {
  type?: string;
  levels?: string[];
  count?: number;
}): Promise<PracticeWrongAnswersResponse> {
  return post<PracticeWrongAnswersResponse>("/api/wrong-answers/practice", body);
}

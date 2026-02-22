import { get } from "./client";
import type {
  PaginatedResponse,
  TestSetItem,
  TestSetDetail,
  QuestionBrief,
} from "./types";

export function listTestSets(params?: {
  type?: "listening" | "reading" | "speaking" | "writing";
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<TestSetItem>> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get<PaginatedResponse<TestSetItem>>(`/api/test-sets${qs ? `?${qs}` : ""}`);
}

export function getTestSet(id: string): Promise<TestSetDetail> {
  return get<TestSetDetail>(`/api/test-sets/${id}`);
}

export function getTestSetQuestions(
  id: string,
  mode: "practice" | "exam" | "review" = "practice",
): Promise<QuestionBrief[]> {
  return get<QuestionBrief[]>(`/api/test-sets/${id}/questions?mode=${mode}`);
}

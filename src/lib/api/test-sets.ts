import { get } from "./client";
import type { RequestOptions } from "./client";
import type {
  PaginatedResponse,
  TestSetItem,
  TestSetDetail,
  QuestionBrief,
  WritingTopicItem,
} from "./types";

export function listTestSets(params?: {
  type?: "listening" | "reading" | "speaking" | "writing";
  task_number?: number;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<TestSetItem>> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.task_number) searchParams.set("task_number", String(params.task_number));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get<PaginatedResponse<TestSetItem>>(`/api/test-sets${qs ? `?${qs}` : ""}`);
}

export function listWritingTopics(params: {
  task_number: number;
  year?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<WritingTopicItem>> {
  const searchParams = new URLSearchParams();
  searchParams.set("task_number", String(params.task_number));
  if (params.year) searchParams.set("year", params.year);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.page_size) searchParams.set("page_size", String(params.page_size));
  return get<PaginatedResponse<WritingTopicItem>>(`/api/test-sets/writing-topics?${searchParams}`);
}

export function getTestSet(id: string, options?: RequestOptions): Promise<TestSetDetail> {
  return get<TestSetDetail>(`/api/test-sets/${id}`, options);
}

export function getTestSetQuestions(
  id: string,
  mode: "practice" | "exam" | "review" = "practice",
  options?: RequestOptions,
): Promise<QuestionBrief[]> {
  return get<QuestionBrief[]>(`/api/test-sets/${id}/questions?mode=${mode}`, options);
}

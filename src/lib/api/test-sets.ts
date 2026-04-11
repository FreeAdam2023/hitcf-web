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
  exam_type?: string;
  task_number?: number;
  group?: "classic" | "extended";
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<TestSetItem>> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.exam_type) searchParams.set("exam_type", params.exam_type);
  if (params?.task_number) searchParams.set("task_number", String(params.task_number));
  if (params?.group) searchParams.set("group", params.group);
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

export function getTestSetCompletion(
  id: string,
  options?: RequestOptions,
): Promise<{ total: number; answered: number }> {
  return get<{ total: number; answered: number }>(`/api/test-sets/${id}/completion`, options);
}

export function getTestSetQuestions(
  id: string,
  mode: "practice" | "exam" | "review" = "practice",
  options?: RequestOptions & { questionIds?: string[] },
): Promise<QuestionBrief[]> {
  let url = `/api/test-sets/${id}/questions?mode=${mode}`;
  if (options?.questionIds?.length) {
    url += `&question_ids=${options.questionIds.join(",")}`;
  }
  return get<QuestionBrief[]>(url, options);
}

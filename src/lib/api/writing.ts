import { post, get } from "./client";
import type { RequestOptions } from "./client";
import type { WritingGradeResponse, WritingHintCard, WritingSidebarItem, WritingSubmissionItem } from "./types";

export function gradeWriting(
  question_id: string,
  task_number: number,
  essay_text: string,
  options?: RequestOptions,
): Promise<WritingGradeResponse> {
  return post<WritingGradeResponse>("/api/writing/grade", {
    question_id,
    task_number,
    essay_text,
  }, options);
}

export function getWritingSubmissions(
  question_id: string,
  options?: RequestOptions,
): Promise<WritingSubmissionItem[]> {
  return get<WritingSubmissionItem[]>(
    `/api/writing/submissions?question_id=${question_id}`,
    options,
  );
}

export interface ConsigneTranslation {
  question_text: string | null;
  passage: string | null;
}

export function getConsigneTranslation(
  questionId: string,
  locale: string = "zh",
  options?: RequestOptions,
): Promise<ConsigneTranslation> {
  return get<ConsigneTranslation>(
    `/api/writing/consigne-translation/${questionId}?locale=${locale}`,
    options,
  );
}

export function getWritingHints(
  questionId: string,
  locale: string = "zh",
  options?: RequestOptions,
): Promise<{ cards: WritingHintCard[] }> {
  return get<{ cards: WritingHintCard[] }>(
    `/api/writing/hints/${questionId}?locale=${locale}`,
    { ...options, timeout: 90_000 },
  );
}

export function getWritingSidebar(
  options?: RequestOptions,
): Promise<WritingSidebarItem[]> {
  return get<WritingSidebarItem[]>("/api/writing/sidebar", options);
}

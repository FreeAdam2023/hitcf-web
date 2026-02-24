import { post, get } from "./client";
import type { RequestOptions } from "./client";
import type { WritingGradeResponse, WritingSubmissionItem } from "./types";

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

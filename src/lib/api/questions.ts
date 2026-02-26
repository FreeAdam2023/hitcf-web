import { get, post } from "./client";
import type { Explanation, QuestionDetail } from "./types";

export function getQuestionDetail(questionId: string): Promise<QuestionDetail> {
  return get<QuestionDetail>(`/api/questions/${questionId}`);
}

export function generateExplanation(
  questionId: string,
  force?: boolean,
): Promise<Explanation> {
  const url = force
    ? `/api/questions/${questionId}/explanation?force=true`
    : `/api/questions/${questionId}/explanation`;
  return post<Explanation>(url);
}

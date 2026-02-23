import { get, post } from "./client";
import type { Explanation, QuestionDetail } from "./types";

export function getQuestionDetail(questionId: string): Promise<QuestionDetail> {
  return get<QuestionDetail>(`/api/questions/${questionId}`);
}

export function generateExplanation(questionId: string): Promise<Explanation> {
  return post<Explanation>(`/api/questions/${questionId}/explanation`);
}

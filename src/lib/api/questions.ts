import { get, post } from "./client";
import type { Explanation, QuestionDetail } from "./types";

export function getQuestionDetail(questionId: string): Promise<QuestionDetail> {
  return get<QuestionDetail>(`/api/questions/${questionId}`);
}

export function generateExplanation(
  questionId: string,
  force?: boolean,
  locale?: string,
): Promise<Explanation> {
  const params = new URLSearchParams();
  if (force) params.set("force", "true");
  if (locale) params.set("locale", locale);
  const qs = params.toString();
  const url = `/api/questions/${questionId}/explanation${qs ? `?${qs}` : ""}`;
  return post<Explanation>(url);
}

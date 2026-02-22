import { get } from "./client";
import type { QuestionDetail } from "./types";

export function getQuestionDetail(questionId: string): Promise<QuestionDetail> {
  return get<QuestionDetail>(`/api/questions/${questionId}`);
}

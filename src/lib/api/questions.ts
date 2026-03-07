import { get, post } from "./client";
import type { Explanation, QuestionDetail, SentenceAnalysis } from "./types";

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

export function generateSentenceAnalysis(
  questionId: string,
  sentenceIndex: number,
  sentenceFr: string,
  locale?: string,
): Promise<SentenceAnalysis> {
  return post<SentenceAnalysis>(`/api/questions/${questionId}/sentence-analysis`, {
    sentence_index: sentenceIndex,
    sentence_fr: sentenceFr,
    locale: locale || undefined,
  });
}

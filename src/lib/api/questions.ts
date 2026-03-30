import { get, post } from "./client";
import type { Explanation, GrammarCard, QuestionDetail, SentenceAnalysis } from "./types";

/** Response from POST/GET explanation endpoints (async generation) */
export type ExplanationResponse =
  | ({ status: "ready" } & Explanation)
  | { status: "generating" }
  | { status: "not_started" };

export function getQuestionDetail(questionId: string): Promise<QuestionDetail> {
  return get<QuestionDetail>(`/api/questions/${questionId}`);
}

export function generateExplanation(
  questionId: string,
  force?: boolean,
  locale?: string,
): Promise<ExplanationResponse> {
  const params = new URLSearchParams();
  if (force) params.set("force", "true");
  if (locale) params.set("locale", locale);
  const qs = params.toString();
  const url = `/api/questions/${questionId}/explanation${qs ? `?${qs}` : ""}`;
  return post<ExplanationResponse>(url, undefined, { timeout: 30_000 });
}

export function getExplanationStatus(
  questionId: string,
  locale?: string,
): Promise<ExplanationResponse> {
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);
  const qs = params.toString();
  const url = `/api/questions/${questionId}/explanation${qs ? `?${qs}` : ""}`;
  return get<ExplanationResponse>(url);
}

/** Response from sentence analysis endpoints (async generation) */
export type SentenceAnalysisResponse =
  | ({ status: "ready" } & SentenceAnalysis)
  | { status: "generating" }
  | { status: "not_started" };

export function generateSentenceAnalysis(
  questionId: string,
  sentenceIndex: number,
  sentenceFr: string,
  locale?: string,
): Promise<SentenceAnalysisResponse> {
  return post<SentenceAnalysisResponse>(`/api/questions/${questionId}/sentence-analysis`, {
    sentence_index: sentenceIndex,
    sentence_fr: sentenceFr,
    locale: locale || undefined,
  }, { timeout: 15_000 });
}

export function getSentenceAnalysisStatus(
  questionId: string,
  sentenceIndex: number,
): Promise<SentenceAnalysisResponse> {
  return get<SentenceAnalysisResponse>(
    `/api/questions/${questionId}/sentence-analysis/${sentenceIndex}`,
  );
}

export function regenerateSentenceAnalysis(
  questionId: string,
  sentenceIndex: number,
  sentenceFr: string,
  locale?: string,
): Promise<SentenceAnalysisResponse> {
  return post<SentenceAnalysisResponse>(`/api/questions/${questionId}/sentence-analysis/regenerate`, {
    sentence_index: sentenceIndex,
    sentence_fr: sentenceFr,
    locale: locale || undefined,
  }, { timeout: 15_000 });
}

export function getGrammarCards(category?: string): Promise<GrammarCard[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return get<GrammarCard[]>(`/api/grammar-cards${qs}`);
}

export function matchGrammarCard(name: string): Promise<GrammarCard | null> {
  return get<GrammarCard | null>(`/api/grammar-cards/match?q=${encodeURIComponent(name)}`);
}


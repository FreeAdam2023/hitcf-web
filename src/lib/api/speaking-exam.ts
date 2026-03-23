import { get, post } from "./client";
import type { RequestOptions } from "./client";

export interface SpeakingExamQuestion {
  id: string;
  question_text: string | null;
  topic: string | null;
  topic_zh: string | null;
  topic_en: string | null;
  topic_ar: string | null;
}

export interface PoolStats {
  total: number;
  done: number;
  remaining: number;
}

export interface StartExamResponse {
  exam_id: string;
  status: string;
  question_range: string;
  range_suggestion?: string;
  is_free_trial?: boolean;
  tache1_session_id: string;
  tache2_session_id: string;
  tache3_session_id: string;
  t2_question: SpeakingExamQuestion;
  t3_question: SpeakingExamQuestion;
  pool_stats: { t2: PoolStats; t3: PoolStats };
}

export interface TacheEvaluation {
  prononciation: { score: number; feedback: string };
  fluidite: { score: number; feedback: string };
  grammaire: { score: number; feedback: string };
  vocabulaire: { score: number; feedback: string };
  accomplissement: { score: number; feedback: string };
  adequation_sociolinguistique: { score: number; feedback: string };
  total_score: number;
  estimated_level: string;
  overall_comment: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
  vocab_suggestions: Array<{ original: string; suggestion: string; reason: string }>;
}

export interface ConversationTurn {
  role: string;
  text: string;
  timestamp: string;
}

export interface TacheSummary {
  session_id: string;
  tache_type: number;
  status: string;
  turn_count: number;
  duration_seconds: number;
  evaluation: TacheEvaluation | null;
  turns?: ConversationTurn[];
}

export interface SpeakingExamDetail {
  id: string;
  status: string;
  question_range: string;
  total_score: number | null;
  estimated_level: string | null;
  ai_feedback: string | null;
  created_at: string;
  completed_at: string | null;
  t2_question: SpeakingExamQuestion;
  t3_question: SpeakingExamQuestion;
  tache1_session_id: string | null;
  tache2_session_id: string | null;
  tache3_session_id: string | null;
  tache1: TacheSummary | null;
  tache2: TacheSummary | null;
  tache3: TacheSummary | null;
}

export interface TrendPoint {
  date: string;
  score: number;
  level: string;
}

export interface TrendStats {
  total_exams: number;
  average_score: number | null;
  best_score: number | null;
  latest_score: number | null;
  improvement: number | null;
}

export interface TrendData {
  points: TrendPoint[];
  stats: TrendStats;
}

export interface SpeakingExamHistoryItem {
  id: string;
  status: string;
  question_range: string;
  total_score: number | null;
  estimated_level: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface SpeakingExamHistoryResponse {
  items: SpeakingExamHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export function startSpeakingExam(
  body: { range: string },
  options?: RequestOptions,
): Promise<StartExamResponse> {
  return post<StartExamResponse>("/api/speaking-exam/start", body, options);
}

export function finishSpeakingExam(
  examId: string,
  body?: { locale?: string },
  options?: RequestOptions,
): Promise<SpeakingExamDetail> {
  return post<SpeakingExamDetail>(
    `/api/speaking-exam/${examId}/finish`,
    body,
    { ...options, timeout: 60_000 },
  );
}

export function abandonSpeakingExam(
  examId: string,
  options?: RequestOptions,
): Promise<{ ok: boolean; status: string }> {
  return post<{ ok: boolean; status: string }>(
    `/api/speaking-exam/${examId}/abandon`,
    undefined,
    options,
  );
}

export function getSpeakingExam(
  examId: string,
  params?: { include_turns?: boolean },
  options?: RequestOptions,
): Promise<SpeakingExamDetail> {
  const sp = new URLSearchParams();
  if (params?.include_turns) sp.set("include_turns", "true");
  const qs = sp.toString();
  return get<SpeakingExamDetail>(
    `/api/speaking-exam/${examId}${qs ? `?${qs}` : ""}`,
    options,
  );
}

export function getSpeakingExamTrend(
  options?: RequestOptions,
): Promise<TrendData> {
  return get<TrendData>("/api/speaking-exam/trend", options);
}

export function checkFreeTrialEligible(
  options?: RequestOptions,
): Promise<{ eligible: boolean }> {
  return get<{ eligible: boolean }>("/api/speaking-exam/free-trial", options);
}

export function listSpeakingExamHistory(
  params?: { page?: number; page_size?: number },
  options?: RequestOptions,
): Promise<SpeakingExamHistoryResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.page_size) sp.set("page_size", String(params.page_size));
  const qs = sp.toString();
  return get<SpeakingExamHistoryResponse>(
    `/api/speaking-exam/history${qs ? `?${qs}` : ""}`,
    options,
  );
}

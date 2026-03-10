import { get, post, put } from "./client";
import type { RequestOptions } from "./client";

export interface WritingExamQuestion {
  id: string;
  question_text: string | null;
  passage: string | null;
  question_number: number;
  topic: string | null;
  topic_zh: string | null;
}

export interface PoolStats {
  total: number;
  done: number;
  remaining: number;
}

export interface StartWritingExamResponse {
  exam_id: string;
  status: string;
  question_range: string;
  time_limit_seconds: number;
  t1_question: WritingExamQuestion;
  t2_question: WritingExamQuestion;
  t3_question: WritingExamQuestion;
  pool_stats: { t1: PoolStats; t2: PoolStats; t3: PoolStats };
  range_suggestion?: string;
}

export interface CriterionFeedback {
  score: number;
  feedback: string;
  highlights: string[];
}

export interface WritingFeedback {
  adequation: CriterionFeedback;
  coherence: CriterionFeedback;
  vocabulaire: CriterionFeedback;
  grammaire: CriterionFeedback;
  total_score: number;
  estimated_nclc: string;
  estimated_level: string;
  overall_comment: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
  vocab_suggestions: Array<{ original: string; suggestion: string; reason: string }>;
}

export interface WritingExamTask {
  task_number: number;
  essay_text: string | null;
  word_count: number;
  feedback: WritingFeedback | null;
}

export interface WritingExamDetail {
  id: string;
  status: string;
  question_range: string;
  time_limit_seconds: number;
  total_score: number | null;
  tcf_score: number | null;
  estimated_level: string | null;
  estimated_nclc: string | null;
  ai_feedback: string | null;
  essays: Record<string, { text: string; word_count: number }>;
  created_at: string;
  completed_at: string | null;
  t1_question: WritingExamQuestion | null;
  t2_question: WritingExamQuestion | null;
  t3_question: WritingExamQuestion | null;
  tasks: WritingExamTask[];
}

export interface WritingExamHistoryItem {
  id: string;
  status: string;
  question_range: string;
  total_score: number | null;
  tcf_score: number | null;
  estimated_level: string | null;
  estimated_nclc: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface WritingExamHistoryResponse {
  items: WritingExamHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface TrendPoint {
  date: string;
  score: number;
  total_score: number;
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

export function startWritingExam(
  body: { range: string },
  options?: RequestOptions,
): Promise<StartWritingExamResponse> {
  return post<StartWritingExamResponse>("/api/writing-exam/start", body, options);
}

export function saveWritingExamEssays(
  examId: string,
  essays: Record<string, { text: string; word_count: number }>,
  options?: RequestOptions,
): Promise<{ ok: boolean }> {
  return put<{ ok: boolean }>(
    `/api/writing-exam/${examId}/save`,
    { essays },
    options,
  );
}

export function completeWritingExam(
  examId: string,
  body?: { locale?: string },
  options?: RequestOptions,
): Promise<WritingExamDetail> {
  return post<WritingExamDetail>(
    `/api/writing-exam/${examId}/complete`,
    body,
    { ...options, timeout: 120_000 },
  );
}

export function abandonWritingExam(
  examId: string,
  options?: RequestOptions,
): Promise<{ ok: boolean; status: string }> {
  return post<{ ok: boolean; status: string }>(
    `/api/writing-exam/${examId}/abandon`,
    undefined,
    options,
  );
}

export function getWritingExam(
  examId: string,
  options?: RequestOptions,
): Promise<WritingExamDetail> {
  return get<WritingExamDetail>(`/api/writing-exam/${examId}`, options);
}

export function listWritingExamHistory(
  params?: { page?: number; page_size?: number },
  options?: RequestOptions,
): Promise<WritingExamHistoryResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.page_size) sp.set("page_size", String(params.page_size));
  const qs = sp.toString();
  return get<WritingExamHistoryResponse>(
    `/api/writing-exam/history${qs ? `?${qs}` : ""}`,
    options,
  );
}

export function getWritingExamTrend(
  options?: RequestOptions,
): Promise<TrendData> {
  return get<TrendData>("/api/writing-exam/trend", options);
}

export function checkWritingFreeTrialEligible(
  options?: RequestOptions,
): Promise<{ eligible: boolean }> {
  return get<{ eligible: boolean }>("/api/writing-exam/free-trial", options);
}

import { get, post } from "./client";
import type { QuestionBrief } from "./types";

/* ── Create ── */
export interface SpeedDrillCreateResponse {
  attempt_id: string;
  total: number;
}

export function startSpeedDrill(params: {
  type?: string;
  levels?: string[];
  count?: number;
  dedup?: boolean;
  include_done?: boolean;
}): Promise<SpeedDrillCreateResponse> {
  const sp = new URLSearchParams();
  if (params.type) sp.set("type", params.type);
  if (params.count != null) sp.set("count", String(params.count));
  if (params.levels) params.levels.forEach((l) => sp.append("levels", l));
  if (params.dedup === false) sp.set("dedup", "false");
  if (params.include_done) sp.set("include_done", "true");
  const qs = sp.toString();
  return post<SpeedDrillCreateResponse>(`/api/speed-drill/next${qs ? `?${qs}` : ""}`);
}

/* ── Navigation (paginated question IDs) ── */
export interface DrillNavResponse {
  attempt_id: string;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  question_ids: string[];
  answered_ids: string[];
  answered_count: number;
}

export function fetchDrillNav(attemptId: string, page = 1, pageSize = 50): Promise<DrillNavResponse> {
  return get<DrillNavResponse>(`/api/speed-drill/${attemptId}/nav?page=${page}&page_size=${pageSize}`);
}

/* ── Single question (on-demand load) ── */
export interface DrillQuestionResponse extends QuestionBrief {
  bookmarked: boolean;
  answered: boolean;
  selected?: string;
  is_correct?: boolean;
  correct_answer?: string;
}

export function loadDrillQuestion(questionId: string, attemptId: string): Promise<DrillQuestionResponse> {
  return get<DrillQuestionResponse>(`/api/speed-drill/question/${questionId}?attempt_id=${attemptId}`);
}

/* ── Resume ── */
export interface SpeedDrillResumeResponse {
  attempt_id: string;
  total: number;
  answered_count: number;
}

export function resumeSpeedDrill(attemptId: string): Promise<SpeedDrillResumeResponse> {
  return get<SpeedDrillResumeResponse>(`/api/speed-drill/resume/${attemptId}`);
}

/* ── In-progress / Abandon ── */
export interface InProgressAttempt {
  attempt_id: string;
  total: number;
  answered_count: number;
  started_at: string;
}

export function getInProgressDrills(): Promise<InProgressAttempt[]> {
  return get<InProgressAttempt[]>("/api/speed-drill/in-progress");
}

export function abandonSpeedDrill(attemptId: string): Promise<void> {
  return post(`/api/speed-drill/abandon/${attemptId}`);
}

/* ── Level stats ── */
export interface LevelStats {
  type: string;
  levels: Record<string, { total: number; raw_total: number; completed: number }>;
}

export function fetchLevelStats(type: string): Promise<LevelStats> {
  return get<LevelStats>(`/api/speed-drill/level-stats?type=${type}`);
}

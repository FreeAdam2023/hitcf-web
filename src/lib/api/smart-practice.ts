import { get, post } from "./client";

/* ── Coverage ── */

export interface SmartPracticeCoverage {
  type: string;
  pool_total: number;
  total_done: number;
  pct: number;
  levels: Array<{
    level: string;
    total: number;
    done: number;
    pct: number;
  }>;
}

export function fetchSmartPracticeCoverage(
  type: "listening" | "reading"
): Promise<SmartPracticeCoverage> {
  return get<SmartPracticeCoverage>(
    `/api/smart-practice/coverage?type=${type}`
  );
}

/* ── Start ── */

export interface SmartQuestionMeta {
  id: string;
  question_number: number;
  level: string;
  type: string;
}

export interface SmartPracticeStartResponse {
  attempt_id: string;
  total: number;
  type: string;
  breakdown: {
    unanswered: number;
    wrong_recycle: number;
    old_recycle: number;
  };
  distribution: Record<string, number>;
  /** Lightweight per-question metadata for the navigator. Full question
   *  detail is loaded on-demand via the drill path. */
  question_meta: SmartQuestionMeta[];
}

export function startSmartPractice(params: {
  type: "listening" | "reading";
  size?: number;
  review?: boolean;
  /** Structured review: follow TCF distribution from answered pool. */
  structured?: boolean;
}): Promise<SmartPracticeStartResponse> {
  const sp = new URLSearchParams();
  sp.set("type", params.type);
  if (params.size != null) sp.set("size", String(params.size));
  if (params.review) sp.set("review", "true");
  if (params.structured) sp.set("structured", "true");
  return post<SmartPracticeStartResponse>(
    `/api/smart-practice/start?${sp.toString()}`
  );
}

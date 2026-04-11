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
}

export function startSmartPractice(params: {
  type: "listening" | "reading";
  size?: number;
}): Promise<SmartPracticeStartResponse> {
  const sp = new URLSearchParams();
  sp.set("type", params.type);
  if (params.size != null) sp.set("size", String(params.size));
  return post<SmartPracticeStartResponse>(
    `/api/smart-practice/start?${sp.toString()}`
  );
}

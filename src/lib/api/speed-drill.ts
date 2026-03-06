import { get, post } from "./client";
import type { QuestionBrief } from "./types";

export interface SpeedDrillResponse {
  attempt_id: string;
  questions: QuestionBrief[];
  remaining: number;
  message?: string;
}

export interface InProgressAttempt {
  attempt_id: string;
  total: number;
  answered_count: number;
  started_at: string;
}

export function startSpeedDrill(params: {
  type?: string;
  levels?: string[];
  count?: number;
  dedup?: boolean;
}): Promise<SpeedDrillResponse> {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set("type", params.type);
  if (params.count != null) searchParams.set("count", String(params.count));
  if (params.levels) {
    params.levels.forEach((l) => searchParams.append("levels", l));
  }
  if (params.dedup === false) searchParams.set("dedup", "false");
  const qs = searchParams.toString();
  return post<SpeedDrillResponse>(
    `/api/speed-drill/next${qs ? `?${qs}` : ""}`,
  );
}

export function getInProgressDrills(): Promise<InProgressAttempt[]> {
  return get<InProgressAttempt[]>("/api/speed-drill/in-progress");
}

export function resumeSpeedDrill(attemptId: string): Promise<SpeedDrillResponse> {
  return get<SpeedDrillResponse>(`/api/speed-drill/resume/${attemptId}`);
}

export function abandonSpeedDrill(attemptId: string): Promise<void> {
  return post(`/api/speed-drill/abandon/${attemptId}`);
}

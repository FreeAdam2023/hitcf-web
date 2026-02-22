import { post } from "./client";
import type { QuestionBrief } from "./types";

export interface SpeedDrillResponse {
  attempt_id: string;
  questions: QuestionBrief[];
  remaining: number;
  message?: string;
}

export function startSpeedDrill(params: {
  type?: string;
  levels?: string[];
  count?: number;
}): Promise<SpeedDrillResponse> {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set("type", params.type);
  if (params.count) searchParams.set("count", String(params.count));
  if (params.levels) {
    params.levels.forEach((l) => searchParams.append("levels", l));
  }
  const qs = searchParams.toString();
  return post<SpeedDrillResponse>(
    `/api/speed-drill/next${qs ? `?${qs}` : ""}`,
  );
}

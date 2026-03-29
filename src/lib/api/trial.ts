import { post, get } from "./client";

export interface ActivateTrialResponse {
  activated: boolean;
  days: number;
  expires_at: string;
}

export interface TrialStatusResponse {
  eligible: boolean;
  activated: boolean;
  days_left: number;
  plan: string | null;
}

export function activateTrial(): Promise<ActivateTrialResponse> {
  return post<ActivateTrialResponse>("/api/trial/activate");
}

export function getTrialStatus(): Promise<TrialStatusResponse> {
  return get<TrialStatusResponse>("/api/trial/status");
}

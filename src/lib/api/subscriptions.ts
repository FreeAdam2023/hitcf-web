import { get, post } from "./client";
import type { SubscriptionInfo } from "./types";

export function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  return get<SubscriptionInfo>("/api/subscriptions/status");
}

export function createCheckout(
  plan: "monthly" | "quarterly" | "semiannual",
): Promise<{ url: string }> {
  return post<{ url: string }>("/api/subscriptions/checkout", { plan });
}

export interface QuotaStatus {
  is_subscriber: boolean;
  questions: { used: number; limit: number; unlimited: boolean };
  explanations: { used: number; limit: number; unlimited: boolean };
}

export function getQuotaStatus(): Promise<QuotaStatus> {
  return get<QuotaStatus>("/api/questions/quota");
}

export function getCustomerPortal(): Promise<{ url: string }> {
  return get<{ url: string }>("/api/subscriptions/portal");
}

export function submitCancelReason(body: {
  reason: string;
}): Promise<{ status: string; current_period_end: string | null }> {
  return post<{ status: string; current_period_end: string | null }>("/api/subscriptions/cancel-reason", body);
}

export function reactivateSubscription() {
  return post<{ status: string }>("/api/subscriptions/reactivate");
}

export interface UsageSummary {
  total_questions: number;
  accuracy: number;
  streak_days: number;
  writing_count: number;
  speaking_count: number;
  vocab_count: number;
}

export function getUsageSummary() {
  return get<UsageSummary>("/api/subscriptions/usage-summary");
}

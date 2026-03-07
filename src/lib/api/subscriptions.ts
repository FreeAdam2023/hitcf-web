import { get, post } from "./client";
import type { SubscriptionInfo } from "./types";

export function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  return get<SubscriptionInfo>("/api/subscriptions/status");
}

export function createCheckout(
  plan: "monthly" | "yearly",
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

import { get, post } from "./client";
import type { SubscriptionInfo } from "./types";

export function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  return get<SubscriptionInfo>("/api/subscriptions/status");
}

export function createCheckout(
  plan: "monthly" | "yearly",
): Promise<{ url: string }> {
  return post<{ url: string }>(`/api/subscriptions/checkout?plan=${plan}`);
}

export function getCustomerPortal(): Promise<{ url: string }> {
  return get<{ url: string }>("/api/subscriptions/portal");
}

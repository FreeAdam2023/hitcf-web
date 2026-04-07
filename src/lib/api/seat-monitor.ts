import { get, post, del } from "./client";

export interface CenterStatus {
  center_id: string;
  city_code: string;
  city_name: string;
  center_name: string;
  address: string;
  maps_url: string;
  registration_url: string;
  available_dates: string[];
  seats_by_date: Record<string, number | null>;
  last_checked_at: string | null;
  scrape_status: string;
  is_subscribed: boolean;
  coming_soon: boolean;
}

export async function getCenters(): Promise<CenterStatus[]> {
  return get<CenterStatus[]>("/api/seat-monitor/centers", { noRedirect: true });
}

export async function subscribeSeat(cityCode: string): Promise<void> {
  await post("/api/seat-monitor/subscribe", { city_code: cityCode });
}

export async function unsubscribeSeat(cityCode: string): Promise<void> {
  await del(`/api/seat-monitor/subscribe/${cityCode}`);
}

export interface SeatSubscription {
  city_code: string;
  created_at: string;
}

export async function getMySeatSubscriptions(): Promise<SeatSubscription[]> {
  return get<SeatSubscription[]>("/api/seat-monitor/my-subscriptions");
}

export interface UnsubInfo {
  city_code: string;
  city_name: string;
  lang: string;
}

export async function getUnsubInfo(token: string): Promise<UnsubInfo> {
  return get<UnsubInfo>(`/api/seat-monitor/unsub-info?token=${encodeURIComponent(token)}`, { noRedirect: true });
}

export async function confirmEmailUnsub(token: string, reason: string): Promise<void> {
  await post("/api/seat-monitor/email-unsubscribe", { token, reason });
}

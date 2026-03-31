import { get, post, del } from "./client";

export interface CenterStatus {
  city_code: string;
  city_name: string;
  center_name: string;
  available_dates: string[];
  last_checked_at: string | null;
  scrape_status: string;
  is_subscribed: boolean;
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

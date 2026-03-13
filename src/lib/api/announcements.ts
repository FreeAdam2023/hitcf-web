import { get, post } from "./client";

export interface AnnouncementItem {
  id: string;
  title: Record<string, string>;
  content: Record<string, string>;
  type: string; // feature | improvement | fix | news
  published_at: string;
  is_unread: boolean;
}

export interface AnnouncementsResponse {
  items: AnnouncementItem[];
  unread_count: number;
}

export function fetchAnnouncements(
  limit = 20,
): Promise<AnnouncementsResponse> {
  return get<AnnouncementsResponse>(
    `/api/announcements?limit=${limit}`,
  );
}

export function markAnnouncementsRead(): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>("/api/announcements/mark-read", {});
}

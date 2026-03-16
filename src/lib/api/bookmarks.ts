import { get, post } from "./client";
import type { PaginatedResponse, BookmarkItem, BookmarkStats, BookmarkDetail } from "./types";

export function toggleBookmark(questionId: string): Promise<{ bookmarked: boolean }> {
  return post<{ bookmarked: boolean }>(`/api/bookmarks/${questionId}`);
}

export function getBookmarkStats(): Promise<BookmarkStats> {
  return get<BookmarkStats>("/api/bookmarks/stats");
}

export function listBookmarks(params?: {
  type?: string;
  level?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<BookmarkItem>> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.level) searchParams.set("level", params.level);
  if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get<PaginatedResponse<BookmarkItem>>(`/api/bookmarks${qs ? `?${qs}` : ""}`);
}

export function getBookmarkDetail(id: string): Promise<BookmarkDetail> {
  return get<BookmarkDetail>(`/api/bookmarks/${id}/detail`);
}

export function checkBookmarks(questionIds: string[]): Promise<{ bookmarked: string[] }> {
  return get<{ bookmarked: string[] }>(`/api/bookmarks/check?question_ids=${questionIds.join(",")}`);
}

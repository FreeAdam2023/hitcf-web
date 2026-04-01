import { del, get, patch, post } from "./client";
import type { PaginatedResponse, HighlightItem } from "./types";

export function createHighlight(body: {
  question_id: string;
  text: string;
  sentence_index?: number | null;
  start_offset: number;
  end_offset: number;
  color?: string;
  tags?: string[];
}): Promise<HighlightItem> {
  return post<HighlightItem>("/api/highlights", body);
}

export function getHighlightsForQuestion(questionId: string): Promise<HighlightItem[]> {
  return get<HighlightItem[]>(`/api/highlights?question_id=${questionId}`);
}

export function listHighlights(params?: {
  has_note?: boolean;
  tag?: string;
  type?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<HighlightItem>> {
  const sp = new URLSearchParams();
  if (params?.has_note !== undefined) sp.set("has_note", String(params.has_note));
  if (params?.tag) sp.set("tag", params.tag);
  if (params?.type) sp.set("type", params.type);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.page_size) sp.set("page_size", String(params.page_size));
  const qs = sp.toString();
  return get<PaginatedResponse<HighlightItem>>(`/api/highlights/list${qs ? `?${qs}` : ""}`);
}

export function updateHighlight(
  id: string,
  body: { color?: string; note?: string | null; tags?: string[] },
): Promise<{ id: string; color: string; note: string | null; tags: string[] }> {
  return patch<{ id: string; color: string; note: string | null; tags: string[] }>(`/api/highlights/${id}`, body);
}

export function deleteHighlight(id: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/api/highlights/${id}`);
}

import { get, post, del } from "./client";
import type {
  VocabularyCardData,
  PaginatedResponse,
  SavedWordItem,
  SavedWordStats,
  NihaoWordItem,
  NihaoFilters,
  NihaoStats,
} from "./types";

export function getVocabularyCard(word: string, locale?: string): Promise<VocabularyCardData> {
  const params = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  return get<VocabularyCardData>(`/api/vocabulary/${encodeURIComponent(word)}${params}`);
}

// Saved words API
export interface SaveWordRequest {
  word: string;
  source_type?: string;
  test_set_id?: string;
  test_set_name?: string;
  question_id?: string;
  question_number?: number;
  sentence?: string;
}

export function saveWord(req: SaveWordRequest): Promise<{ id: string; word: string }> {
  return post("/api/vocab/saved", req);
}

export function unsaveWord(word: string): Promise<{ ok: boolean }> {
  return del(`/api/vocab/saved/${encodeURIComponent(word)}`);
}

export function listSavedWords(params?: {
  source_type?: string;
  test_set_id?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<SavedWordItem>> {
  const searchParams = new URLSearchParams();
  if (params?.source_type) searchParams.set("source_type", params.source_type);
  if (params?.test_set_id) searchParams.set("test_set_id", params.test_set_id);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get(`/api/vocab/saved${qs ? `?${qs}` : ""}`);
}

export function checkSavedWords(words?: string[]): Promise<{ words: string[] }> {
  if (words && words.length > 0) {
    return get(`/api/vocab/saved/check?words=${words.map(encodeURIComponent).join(",")}`);
  }
  // No words param: returns all saved words
  return get("/api/vocab/saved/check");
}

export function getSavedWordStats(): Promise<SavedWordStats> {
  return get("/api/vocab/saved/stats");
}

// Export saved words — triggers browser download
export async function exportSavedWords(sourceType?: string): Promise<void> {
  const params = new URLSearchParams();
  if (sourceType) params.set("source_type", sourceType);
  const qs = params.toString();
  const res = await fetch(`/api/vocab/saved/export${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename="(.+?)"/);
  const filename = match?.[1] || "vocabulary.apkg";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Nihao French API
export function listNihaoWords(params?: {
  level?: string;
  lesson?: number;
  theme?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<NihaoWordItem>> {
  const searchParams = new URLSearchParams();
  if (params?.level) searchParams.set("level", params.level);
  if (params?.lesson != null) searchParams.set("lesson", String(params.lesson));
  if (params?.theme) searchParams.set("theme", params.theme);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get(`/api/vocab/nihao${qs ? `?${qs}` : ""}`);
}

export function getNihaoFilters(): Promise<NihaoFilters> {
  return get("/api/vocab/nihao/filters");
}

export function getNihaoStats(): Promise<NihaoStats> {
  return get("/api/vocab/nihao/stats");
}

export async function exportNihaoWords(
  level?: string,
  lesson?: number,
  theme?: string,
): Promise<void> {
  const params = new URLSearchParams();
  if (level) params.set("level", level);
  if (lesson != null) params.set("lesson", String(lesson));
  if (theme) params.set("theme", theme);
  const qs = params.toString();
  const res = await fetch(`/api/vocab/nihao/export${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename="(.+?)"/);
  const filename = match?.[1] || "nihao_vocab.apkg";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import { get, post, del } from "./client";
import type {
  VocabularyCardData,
  PaginatedResponse,
  SavedWordItem,
  SavedWordStats,
  NihaoWordItem,
  NihaoFilters,
  NihaoStats,
  ThemeWordItem,
  ThemeFilters,
  ThemeStats,
  ExpressionWordItem,
  ExpressionFilters,
  ExpressionStats,
  RandomExpression,
} from "./types";

// First-time card generation calls Azure Dict + Grok + TTS and can take 30-50s
const VOCAB_CARD_TIMEOUT_MS = 60_000;

export function getVocabularyCard(word: string, locale?: string): Promise<VocabularyCardData> {
  const params = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  return get<VocabularyCardData>(`/api/vocabulary/${encodeURIComponent(word)}${params}`, {
    timeout: VOCAB_CARD_TIMEOUT_MS,
  });
}

export interface PronounceResult {
  form: string;
  audio_url: string;
  lemma: string;
}

export function pronounceForm(form: string, lemma?: string): Promise<PronounceResult> {
  const params = new URLSearchParams({ form });
  if (lemma) params.set("lemma", lemma);
  return post<PronounceResult>(`/api/vocabulary/pronounce?${params.toString()}`, {});
}

export function regenerateVocabularyCard(word: string, locale?: string): Promise<VocabularyCardData> {
  const params = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  return post<VocabularyCardData>(`/api/vocabulary/${encodeURIComponent(word)}/regenerate${params}`, {}, {
    timeout: VOCAB_CARD_TIMEOUT_MS,
  });
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
  source?: string;
  test_set_id?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<SavedWordItem>> {
  const searchParams = new URLSearchParams();
  if (params?.source_type) searchParams.set("source_type", params.source_type);
  if (params?.source) searchParams.set("source", params.source);
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

// Export error handling
export class ExportLimitError extends Error {
  limit?: number;
  constructor(public status: number, message: string, limit?: number) {
    super(message);
    this.name = "ExportLimitError";
    this.limit = limit;
  }
}

async function handleExportError(res: Response): Promise<never> {
  if (res.status === 401) throw new ExportLimitError(401, "Login required");
  if (res.status === 429) throw new ExportLimitError(429, "Rate limit exceeded");
  if (res.status === 403) {
    let limit: number | undefined;
    try {
      const body = await res.json();
      limit = body?.detail?.limit;
    } catch { /* ignore */ }
    throw new ExportLimitError(403, "Word count limit exceeded", limit);
  }
  throw new Error("Export failed");
}

async function handleExportResponse(res: Response, fallbackFilename: string) {
  if (!res.ok) await handleExportError(res);
  const blob = await res.blob();
  const cd = res.headers.get("content-disposition") || "";
  // Prefer filename* (RFC 5987, UTF-8) over plain filename
  const utf8Match = cd.match(/filename\*=UTF-8''(.+?)(?:;|$)/i);
  const plainMatch = cd.match(/filename="(.+?)"/);
  const filename = utf8Match?.[1]
    ? decodeURIComponent(utf8Match[1])
    : plainMatch?.[1] || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export timeout — first export may trigger card generation (3 min)
const EXPORT_TIMEOUT_MS = 180_000;

// Export saved words — triggers browser download (legacy sync)
export async function exportSavedWords(sourceType?: string): Promise<void> {
  const params = new URLSearchParams();
  if (sourceType) params.set("source_type", sourceType);
  const qs = params.toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXPORT_TIMEOUT_MS);
  try {
    const res = await fetch(`/api/vocab/saved/export${qs ? `?${qs}` : ""}`, {
      signal: controller.signal,
    });
    await handleExportResponse(res, "vocabulary.apkg");
  } finally {
    clearTimeout(timer);
  }
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

// Legacy sync export
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXPORT_TIMEOUT_MS);
  try {
    const res = await fetch(`/api/vocab/nihao/export${qs ? `?${qs}` : ""}`, {
      signal: controller.signal,
    });
    await handleExportResponse(res, "nihao_vocab.apkg");
  } finally {
    clearTimeout(timer);
  }
}

// Theme Words API (thematic vocabulary pool)
export function listThemeWords(params?: {
  tag?: string;
  tag_category?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<ThemeWordItem>> {
  const searchParams = new URLSearchParams();
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.tag_category) searchParams.set("tag_category", params.tag_category);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return get(`/api/vocab/theme${qs ? `?${qs}` : ""}`);
}

export function getThemeFilters(): Promise<ThemeFilters> {
  return get("/api/vocab/theme/filters");
}

export function getThemeStats(): Promise<ThemeStats> {
  return get("/api/vocab/theme/stats");
}

// ---------------------------------------------------------------------------
// Expression Words (口语写作素材)
// ---------------------------------------------------------------------------

export function listExpressionWords(params?: {
  category?: string;
  cefr_level?: string;
  tag?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<ExpressionWordItem>> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.cefr_level) qs.set("cefr_level", params.cefr_level);
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  const q = qs.toString();
  return get(`/api/vocab/expression${q ? `?${q}` : ""}`);
}

export function getExpressionFilters(): Promise<ExpressionFilters> {
  return get("/api/vocab/expression/filters");
}

export function getExpressionStats(): Promise<ExpressionStats> {
  return get("/api/vocab/expression/stats");
}

/** Fetch a uniformly random expression from the pool. Powers PhraseTicker. */
export function getRandomExpression(): Promise<RandomExpression> {
  return get("/api/vocab/expression/random");
}

// ---------------------------------------------------------------------------
// Async export API (start → poll → download)
// ---------------------------------------------------------------------------

export interface ExportStatus {
  status: "pending" | "generating_cards" | "building_deck" | "ready" | "failed";
  total: number;
  completed: number;
  error: string | null;
}

export async function startNihaoExport(
  level?: string,
  lesson?: number,
  theme?: string,
): Promise<{ job_id: string }> {
  const params = new URLSearchParams();
  if (level) params.set("level", level);
  if (lesson != null) params.set("lesson", String(lesson));
  if (theme) params.set("theme", theme);
  const qs = params.toString();
  const res = await fetch(`/api/vocab/nihao/export/start${qs ? `?${qs}` : ""}`, {
    method: "POST",
  });
  if (!res.ok) await handleExportError(res);
  return res.json();
}

export async function startThemeExport(
  tag?: string,
  tagCategory?: string,
): Promise<{ job_id: string }> {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (tagCategory) params.set("tag_category", tagCategory);
  const qs = params.toString();
  const res = await fetch(`/api/vocab/theme/export/start${qs ? `?${qs}` : ""}`, {
    method: "POST",
  });
  if (!res.ok) await handleExportError(res);
  return res.json();
}

export async function startExpressionExport(
  category?: string,
  cefrLevel?: string,
  tag?: string,
): Promise<{ job_id: string }> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (cefrLevel) params.set("cefr_level", cefrLevel);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  const res = await fetch(`/api/vocab/expression/export/start${qs ? `?${qs}` : ""}`, {
    method: "POST",
  });
  if (!res.ok) await handleExportError(res);
  return res.json();
}

export async function startSavedExport(
  sourceType?: string,
): Promise<{ job_id: string }> {
  const params = new URLSearchParams();
  if (sourceType) params.set("source_type", sourceType);
  const qs = params.toString();
  const res = await fetch(`/api/vocab/saved/export/start${qs ? `?${qs}` : ""}`, {
    method: "POST",
  });
  if (!res.ok) await handleExportError(res);
  return res.json();
}

export async function getExportStatus(
  type: "nihao" | "saved" | "theme" | "expression",
  jobId: string,
): Promise<ExportStatus> {
  const res = await fetch(`/api/vocab/${type}/export/status/${jobId}`);
  if (!res.ok) throw new Error("Status check failed");
  return res.json();
}

export async function downloadExportFile(
  type: "nihao" | "saved" | "theme" | "expression",
  jobId: string,
): Promise<void> {
  const res = await fetch(`/api/vocab/${type}/export/download/${jobId}`);
  await handleExportResponse(res, "vocabulary.apkg");
}

/** Log a word view, returns auto_saved flag */
export async function logWordView(
  word: string,
  sourceType?: string | null,
  pool: "saved" | "nihao" | "theme" | "expression" = "saved",
): Promise<boolean> {
  try {
    const res = await post<{ ok: boolean; auto_saved: boolean }>("/api/vocab/view", {
      word,
      source_type: sourceType ?? null,
      pool,
    });
    return res.auto_saved;
  } catch {
    return false;
  }
}

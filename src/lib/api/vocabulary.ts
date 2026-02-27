import { get } from "./client";
import type { VocabularyCardData } from "./types";

export function getVocabularyCard(word: string, locale?: string): Promise<VocabularyCardData> {
  const params = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  return get<VocabularyCardData>(`/api/vocabulary/${encodeURIComponent(word)}${params}`);
}

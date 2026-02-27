import type { VocabularyCardData } from "./api/types";

/** In-session Map cache to avoid duplicate fetches for the same word+locale. */
const cache = new Map<string, VocabularyCardData>();

function _key(word: string, locale?: string): string {
  return `${word.toLowerCase()}:${locale || "zh"}`;
}

export function getCached(word: string, locale?: string): VocabularyCardData | undefined {
  return cache.get(_key(word, locale));
}

export function setCache(word: string, data: VocabularyCardData, locale?: string): void {
  cache.set(_key(word, locale), data);
}

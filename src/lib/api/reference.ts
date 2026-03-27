import { get } from "./client";
import type { GrammarReferenceItem, GrammarReferenceDetail } from "./types";

export function listReferences(
  locale: string,
): Promise<GrammarReferenceItem[]> {
  return get<GrammarReferenceItem[]>(
    `/api/reference?locale=${encodeURIComponent(locale)}`,
  );
}

export function getReferenceBySlug(
  slug: string,
  locale: string,
): Promise<GrammarReferenceDetail | null> {
  return get<GrammarReferenceDetail | null>(
    `/api/reference/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
  );
}

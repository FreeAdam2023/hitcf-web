import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SavedWordsView } from "./saved-words-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.vocabularyMySaved");
  return { title: t("title") };
}

export default function MySavedPage() {
  return <SavedWordsView />;
}

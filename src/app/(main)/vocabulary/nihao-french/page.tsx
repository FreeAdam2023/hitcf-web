import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NihaoWordsView } from "./nihao-words-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.vocabularyNihao");
  return { title: t("title") };
}

export default function NihaoFrenchPage() {
  return <NihaoWordsView />;
}

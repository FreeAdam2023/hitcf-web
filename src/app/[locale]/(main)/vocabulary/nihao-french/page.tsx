import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NihaoWordsView } from "./nihao-words-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.vocabularyNihao" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/vocabulary/nihao-french`,
      languages: { zh: "/zh/vocabulary/nihao-french", en: "/en/vocabulary/nihao-french", fr: "/fr/vocabulary/nihao-french", ar: "/ar/vocabulary/nihao-french" },
    },
  };
}

export default function NihaoFrenchPage() {
  return <NihaoWordsView />;
}

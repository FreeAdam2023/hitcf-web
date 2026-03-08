import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HistoryList } from "./history-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.history" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/history`,
      languages: { zh: "/zh/history", en: "/en/history", fr: "/fr/history", ar: "/ar/history" },
    },
  };
}

export default function HistoryPage() {
  return <HistoryList />;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HistoryList } from "./history-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.history");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/history" },
  };
}

export default function HistoryPage() {
  return <HistoryList />;
}

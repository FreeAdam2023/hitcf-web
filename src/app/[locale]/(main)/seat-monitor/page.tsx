import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SeatMonitorView } from "./seat-monitor-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.seatMonitor" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/seat-monitor`,
      languages: { zh: "/zh/seat-monitor", en: "/en/seat-monitor", fr: "/fr/seat-monitor", ar: "/ar/seat-monitor" },
    },
  };
}

export default function SeatMonitorPage() {
  return <SeatMonitorView />;
}

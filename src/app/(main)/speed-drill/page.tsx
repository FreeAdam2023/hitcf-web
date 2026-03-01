import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SpeedDrillConfig } from "./speed-drill-config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.speedDrill");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/speed-drill" },
  };
}

export default function SpeedDrillPage() {
  return <SpeedDrillConfig />;
}

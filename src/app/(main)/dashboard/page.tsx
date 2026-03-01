import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardView } from "./dashboard-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.dashboard");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/dashboard" },
  };
}

export default function DashboardPage() {
  return <DashboardView />;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResourcesContent } from "./resources-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.resources");
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(","),
    alternates: { canonical: "/resources" },
  };
}

export default function ResourcesPage() {
  return <ResourcesContent />;
}

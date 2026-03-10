import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { STATS_PARAMS } from "@/lib/constants";
import { TestList } from "./test-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.tests" });
  return {
    title: t("title", STATS_PARAMS),
    description: t("description", STATS_PARAMS),
    alternates: {
      canonical: `/${locale}/tests`,
      languages: { zh: "/zh/tests", en: "/en/tests", fr: "/fr/tests", ar: "/ar/tests" },
    },
  };
}

export default function TestsPage() {
  return (
    <div>
      <TestList />
    </div>
  );
}

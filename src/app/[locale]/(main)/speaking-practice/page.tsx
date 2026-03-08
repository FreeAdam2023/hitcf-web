import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import SpeakingPracticeView from "./speaking-practice-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.speakingPractice" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/speaking-practice`,
      languages: { zh: "/zh/speaking-practice", en: "/en/speaking-practice", fr: "/fr/speaking-practice", ar: "/ar/speaking-practice" },
    },
  };
}

export default function SpeakingPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      }
    >
      <SpeakingPracticeView />
    </Suspense>
  );
}

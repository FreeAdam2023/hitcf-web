import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import SpeakingPracticeView from "./speaking-practice-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.speakingPractice");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/speaking-practice" },
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

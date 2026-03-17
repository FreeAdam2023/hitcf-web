import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SpeakingScriptsView } from "./speaking-scripts-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.speakingScripts" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/speaking-scripts`,
      languages: {
        zh: "/zh/speaking-scripts",
        en: "/en/speaking-scripts",
        fr: "/fr/speaking-scripts",
        ar: "/ar/speaking-scripts",
      },
    },
  };
}

export default function SpeakingScriptsPage() {
  return <SpeakingScriptsView />;
}

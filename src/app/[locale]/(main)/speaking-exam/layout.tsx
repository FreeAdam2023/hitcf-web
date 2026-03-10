import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.speakingExam" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/speaking-exam`,
      languages: {
        zh: "/zh/speaking-exam",
        en: "/en/speaking-exam",
        fr: "/fr/speaking-exam",
        ar: "/ar/speaking-exam",
      },
    },
  };
}

export default function SpeakingExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

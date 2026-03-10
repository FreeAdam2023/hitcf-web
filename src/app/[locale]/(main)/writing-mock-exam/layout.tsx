import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.writingMockExam" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/writing-mock-exam`,
      languages: {
        zh: "/zh/writing-mock-exam",
        en: "/en/writing-mock-exam",
        fr: "/fr/writing-mock-exam",
        ar: "/ar/writing-mock-exam",
      },
    },
  };
}

export default function WritingMockExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

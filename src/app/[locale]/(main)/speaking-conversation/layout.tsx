import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.speakingConversation" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/speaking-conversation`,
      languages: { zh: "/zh/speaking-conversation", en: "/en/speaking-conversation", fr: "/fr/speaking-conversation", ar: "/ar/speaking-conversation" },
    },
  };
}

export default function SpeakingConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

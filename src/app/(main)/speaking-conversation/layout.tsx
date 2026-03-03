import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.speakingConversation");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/speaking-conversation" },
  };
}

export default function SpeakingConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WrongAnswerList } from "./wrong-answer-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.wrongAnswers");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/wrong-answers" },
  };
}

export default function WrongAnswersPage() {
  return <WrongAnswerList />;
}

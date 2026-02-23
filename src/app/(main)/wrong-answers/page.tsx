import type { Metadata } from "next";
import { WrongAnswerList } from "./wrong-answer-list";

export const metadata: Metadata = {
  title: "错题本",
  description: "追踪和复习你的 TCF Canada 错题，针对薄弱环节专项练习。",
  alternates: { canonical: "/wrong-answers" },
};

export default function WrongAnswersPage() {
  return <WrongAnswerList />;
}

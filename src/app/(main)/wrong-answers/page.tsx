import type { Metadata } from "next";
import { WrongAnswerList } from "./wrong-answer-list";

export const metadata: Metadata = {
  title: "错题本 · 追踪薄弱环节定向突破",
  description:
    "自动收集 TCF Canada 听力和阅读的错题，按类型、等级和掌握状态筛选。支持一键生成错题练习，针对性突破薄弱环节。",
  alternates: { canonical: "/wrong-answers" },
};

export default function WrongAnswersPage() {
  return <WrongAnswerList />;
}

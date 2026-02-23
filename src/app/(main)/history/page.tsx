import type { Metadata } from "next";
import { HistoryList } from "./history-list";

export const metadata: Metadata = {
  title: "练习记录 · 查看所有 TCF 练习和考试成绩",
  description:
    "查看你的所有 TCF Canada 练习和考试记录，包括得分、CLB 等级估算和用时。追踪每套题的完成进度和成绩趋势。",
  alternates: { canonical: "/history" },
};

export default function HistoryPage() {
  return <HistoryList />;
}

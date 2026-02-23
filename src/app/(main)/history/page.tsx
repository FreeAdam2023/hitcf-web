import type { Metadata } from "next";
import { HistoryList } from "./history-list";

export const metadata: Metadata = {
  title: "练习记录",
  description: "查看你的所有 TCF Canada 练习和考试记录。",
  alternates: { canonical: "/history" },
};

export default function HistoryPage() {
  return <HistoryList />;
}

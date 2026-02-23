import type { Metadata } from "next";
import { SpeedDrillConfig } from "./speed-drill-config";

export const metadata: Metadata = {
  title: "速练模式 · 按等级和题型定向刷题",
  description:
    "TCF Canada 速练模式：选择听力或阅读，按 A1-C2 等级筛选，利用碎片时间高效刷题。自动跳过已做题目，专注薄弱环节。",
  alternates: { canonical: "/speed-drill" },
};

export default function SpeedDrillPage() {
  return <SpeedDrillConfig />;
}

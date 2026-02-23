import type { Metadata } from "next";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "仪表盘",
  description: "查看你的 CLB 7 准备度、练习统计、正确率趋势和连续打卡天数。",
  alternates: { canonical: "/dashboard" },
};

export default function DashboardPage() {
  return <DashboardView />;
}

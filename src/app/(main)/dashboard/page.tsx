import type { Metadata } from "next";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "我的仪表盘 · CLB 7 准备度与练习统计",
  description:
    "查看你的 CLB 7 准备度、听力和阅读正确率、练习统计、连续打卡天数。实时追踪与 78% 目标正确率的差距。",
  alternates: { canonical: "/dashboard" },
};

export default function DashboardPage() {
  return <DashboardView />;
}

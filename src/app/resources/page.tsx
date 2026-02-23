import type { Metadata } from "next";
import { ResourcesContent } from "./resources-content";

export const metadata: Metadata = {
  title: "TCF Canada 考试指南 · 分数对照、学习资源、考场信息",
  description:
    "TCF Canada 考试全面指南：考试内容与格式、NCLC/CLB 分数对照表、免费法语学习资源推荐、中国及加拿大考场信息汇总。",
  keywords: [
    "TCF Canada 考试",
    "CLB 分数对照",
    "NCLC 对照表",
    "TCF 考场",
    "法语学习资源",
    "TCF Canada 报名",
    "加拿大移民法语考试",
  ],
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}

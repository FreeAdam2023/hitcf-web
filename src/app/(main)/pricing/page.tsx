import type { Metadata } from "next";
import { PricingView } from "./pricing-view";

export const metadata: Metadata = {
  title: "订阅方案 · 年付享 2 个月免费试用全部 TCF 题库",
  description:
    "HiTCF 订阅方案：免费题套直接练习，Pro 版解锁全部 3,400+ 道真题、考试模式、错题本。年付 2 个月免费试用，随时取消。",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingView />;
}

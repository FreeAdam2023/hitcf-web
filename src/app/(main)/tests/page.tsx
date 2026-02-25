import type { Metadata } from "next";
import { TestList } from "./test-list";
import { PlacementBanner } from "@/components/shared/placement-banner";

export const metadata: Metadata = {
  title: "TCF Canada 题库 · 3,400+ 道听力阅读口语写作真题",
  description:
    "TCF Canada 听力、阅读、口语、写作全真模拟题库。42 套听力含音频，44 套阅读，覆盖 A1-C2 全等级。",
  alternates: { canonical: "/tests" },
};

export default function TestsPage() {
  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 py-8">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-4 right-16 h-20 w-20 rounded-full bg-chart-2/10 blur-2xl" />
        <h1 className="relative text-2xl font-bold tracking-tight">题库</h1>
        <p className="relative mt-1.5 text-sm text-muted-foreground">
          TCF Canada 听力、阅读、口语、写作全真模拟
        </p>
      </div>
      <PlacementBanner />
      <TestList />
    </div>
  );
}

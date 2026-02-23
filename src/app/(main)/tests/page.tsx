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
      <div className="mb-8 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-8">
        <h1 className="text-2xl font-bold">题库</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          TCF Canada 听力、阅读、口语、写作全真模拟
        </p>
      </div>
      <PlacementBanner />
      <TestList />
    </div>
  );
}

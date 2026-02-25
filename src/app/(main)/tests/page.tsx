import type { Metadata } from "next";
import { TestList } from "./test-list";
import { PlacementBanner } from "@/components/shared/placement-banner";

export const metadata: Metadata = {
  title: "TCF Canada 题库 · 8,500+ 道听力阅读口语写作真题",
  description:
    "TCF Canada 听力、阅读、口语、写作全真模拟题库。42 套听力含音频，44 套阅读，覆盖 A1-C2 全等级。",
  alternates: { canonical: "/tests" },
};

export default function TestsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            题库
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          TCF Canada 听力、阅读、口语、写作全真模拟
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-400">
            44 套听力
          </span>
          <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
            44 套阅读
          </span>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            696 口语话题
          </span>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
            515 写作套题
          </span>
        </div>
      </div>
      <PlacementBanner />
      <TestList />
    </div>
  );
}

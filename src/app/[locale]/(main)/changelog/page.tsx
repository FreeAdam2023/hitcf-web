"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, Zap } from "lucide-react";

interface ChangelogEntry {
  date: string;
  version?: string;
  type: "feature" | "improvement" | "fix";
  title: string;
  details?: string[];
}

const TYPE_CONFIG = {
  feature: { label: "新功能", icon: Sparkles, color: "bg-emerald-600 text-white" },
  improvement: { label: "优化", icon: Zap, color: "bg-blue-600 text-white" },
  fix: { label: "修复", icon: Wrench, color: "bg-orange-600 text-white" },
};

// Only user-facing changes — no admin/backend internals
const changelog: ChangelogEntry[] = [
  {
    date: "2026-03-25",
    type: "fix",
    title: "开卷模式移动端修复",
    details: [
      "移动端底部恢复「下一题」按钮（之前被「已阅」替换）",
      "修复悬浮题目导航按钮在移动端不可见的问题",
      "修复 Enter 键无法触发「已阅」按钮的问题",
    ],
  },
  {
    date: "2026-03-25",
    type: "fix",
    title: "等级练习加载错误修复",
    details: ["修复等级练习中已答题目加载时的 500 错误"],
  },
  {
    date: "2026-03-24",
    type: "feature",
    title: "功能介绍页面",
    details: ["新增 /guide 平台使用指南", "新增更新日志页面"],
  },
];

export default function ChangelogPage() {
  const t = useTranslations();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t("changelog.title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("changelog.subtitle")}</p>

      <div className="mt-8 space-y-0">
        {changelog.map((entry, i) => {
          const cfg = TYPE_CONFIG[entry.type];
          return (
            <div key={i} className="relative flex gap-4 pb-8">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-1.5 ${cfg.color}`}>
                  <cfg.icon className="h-3.5 w-3.5" />
                </div>
                {i < changelog.length - 1 && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <time className="text-xs text-muted-foreground">{entry.date}</time>
                  <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                </div>
                <h3 className="mt-1 text-base font-semibold">{entry.title}</h3>
                {entry.details && (
                  <ul className="mt-2 space-y-1">
                    {entry.details.map((d, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

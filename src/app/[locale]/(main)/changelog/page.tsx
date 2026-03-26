"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, Zap } from "lucide-react";
import { changelog, markChangelogRead } from "@/lib/changelog";

const TYPE_CONFIG = {
  feature: { label: "新功能", icon: Sparkles, color: "bg-emerald-600 text-white" },
  improvement: { label: "优化", icon: Zap, color: "bg-blue-600 text-white" },
  fix: { label: "修复", icon: Wrench, color: "bg-orange-600 text-white" },
};

export default function ChangelogPage() {
  const t = useTranslations();

  useEffect(() => {
    markChangelogRead();
  }, []);

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

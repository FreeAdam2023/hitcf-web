"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Headphones, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePracticeStore } from "@/stores/practice-store";
import { startSpeedDrill } from "@/lib/api/speed-drill";
import { cn } from "@/lib/utils";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const COUNT_OPTIONS = [5, 10, 15, 20];

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  A2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  B2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  C1: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  C2: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

export function SpeedDrillConfig() {
  const router = useRouter();
  const initPractice = usePracticeStore((s) => s.init);

  const [type, setType] = useState("listening");
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(LEVELS));
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const selectAll = () => setSelectedLevels(new Set(LEVELS));

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const levels = selectedLevels.size === LEVELS.length ? undefined : Array.from(selectedLevels);
      const result = await startSpeedDrill({ type, levels, count });

      if (!result.questions.length) {
        setError("没有更多未做过的题目");
        setLoading(false);
        return;
      }

      initPractice(result.attempt_id, result.questions);
      router.push(`/practice/${result.attempt_id}`);
    } catch {
      setError("启动速练失败，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            速练模式
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          选择类型和等级，利用碎片时间高效刷题
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="space-y-6 pt-6">
          {/* Type selection */}
          <div>
            <p className="mb-3 text-sm font-medium">选择类型</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("listening")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                  type === "listening"
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/50"
                    : "border-transparent bg-secondary/50 hover:bg-secondary",
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  type === "listening" ? "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-400" : "bg-muted text-muted-foreground",
                )}>
                  <Headphones className="h-5 w-5" />
                </div>
                <span className={cn("text-sm font-medium", type === "listening" ? "text-foreground" : "text-muted-foreground")}>
                  听力
                </span>
              </button>
              <button
                onClick={() => setType("reading")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                  type === "reading"
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/50"
                    : "border-transparent bg-secondary/50 hover:bg-secondary",
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  type === "reading" ? "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400" : "bg-muted text-muted-foreground",
                )}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className={cn("text-sm font-medium", type === "reading" ? "text-foreground" : "text-muted-foreground")}>
                  阅读
                </span>
              </button>
            </div>
          </div>

          {/* Level selection */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">选择等级</p>
              <button
                onClick={selectAll}
                className="text-xs text-primary hover:underline"
              >
                全选
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => {
                const active = selectedLevels.has(level);
                return (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                      active
                        ? LEVEL_COLORS[level]
                        : "bg-secondary text-muted-foreground/60 hover:text-muted-foreground",
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count selection */}
          <div>
            <p className="mb-3 text-sm font-medium">题目数量</p>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cn(
                    "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
                    count === n
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n} 题
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleStart}
        disabled={loading || selectedLevels.size === 0}
      >
        <Zap className="mr-1.5 h-4 w-4" />
        {loading ? "正在生成..." : "开始速练"}
      </Button>
    </div>
  );
}

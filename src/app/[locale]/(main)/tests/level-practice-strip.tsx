"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startSpeedDrill } from "@/lib/api/speed-drill";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  type: "listening" | "reading";
  /** How many questions the level practice should have by default. */
  defaultCount?: number;
}

const LEVELS: Array<{ level: string; color: string }> = [
  { level: "A1", color: "hover:border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { level: "A2", color: "hover:border-green-500/40 hover:bg-green-500/10 text-green-700 dark:text-green-400" },
  { level: "B1", color: "hover:border-blue-500/40 hover:bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { level: "B2", color: "hover:border-violet-500/40 hover:bg-violet-500/10 text-violet-700 dark:text-violet-400" },
  { level: "C1", color: "hover:border-amber-500/40 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { level: "C2", color: "hover:border-rose-500/40 hover:bg-rose-500/10 text-rose-700 dark:text-rose-400" },
];

export function LevelPracticeStrip({ type, defaultCount = 20 }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStart = async (level: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setLoading(level);
    try {
      const res = await startSpeedDrill({
        type,
        levels: [level],
        count: defaultCount,
        dedup: true,
      });
      if (res.attempt_id) {
        router.push(`/practice/${res.attempt_id}`);
      } else {
        toast.error(t("speedDrill.noMoreQuestions"));
        setLoading(null);
      }
    } catch {
      toast.error(t("common.errors.generic"));
      setLoading(null);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-border/60 bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground pr-2 border-r">
          <Layers className="h-4 w-4" />
          <span>{t("speedDrill.title")}</span>
        </div>
        {LEVELS.map(({ level, color }) => (
          <Button
            key={level}
            variant="outline"
            size="sm"
            onClick={() => handleStart(level)}
            disabled={loading !== null}
            className={`min-w-[56px] border-2 font-semibold ${color}`}
          >
            {loading === level ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              level
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}

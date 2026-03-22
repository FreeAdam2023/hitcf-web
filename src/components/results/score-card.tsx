"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { getEstimatedTcfLevel, getTcfPoints, TCF_MAX_SCORE } from "@/lib/tcf-levels";
import { cn, formatTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ReviewAnswer } from "@/lib/api/types";

interface ScoreCardProps {
  score: number;
  total: number;
  answeredCount?: number;
  timeTakenSeconds?: number | null;
  tcfPoints?: number;
  answers?: ReviewAnswer[];
}

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function CircularProgress({
  value,
  size = 140,
  strokeWidth = 8,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const pct = Math.min(Math.max(value, 0), 100);
  const progressLen = animated ? (pct / 100) * circumference : 0;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Background track — full ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted-foreground/15"
      />
      {/* Progress arc — round caps */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progressLen}
        className="transition-all ease-out"
        style={{ transitionDuration: "1.4s" }}
      />
    </svg>
  );
}

/** Score grid row definitions */
const GRID_ROWS: { range: [number, number] }[] = [
  { range: [1, 10] },
  { range: [11, 20] },
  { range: [21, 30] },
  { range: [31, 39] },
];

const CORRECT_SHADES: Record<number, string> = {
  3:  "bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-300",
  9:  "bg-green-300 text-green-900 dark:bg-green-800/50 dark:text-green-200",
  15: "bg-green-400 text-white dark:bg-green-700/60 dark:text-green-100",
  21: "bg-green-500 text-white dark:bg-green-600/70 dark:text-green-50",
  26: "bg-green-600 text-white dark:bg-green-600 dark:text-white",
  33: "bg-green-700 text-white dark:bg-green-500 dark:text-white",
};

const WRONG_SHADES: Record<number, string> = {
  3:  "bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300",
  9:  "bg-red-300 text-red-900 dark:bg-red-800/50 dark:text-red-200",
  15: "bg-red-400 text-white dark:bg-red-700/60 dark:text-red-100",
  21: "bg-red-500 text-white dark:bg-red-600/70 dark:text-red-50",
  26: "bg-red-600 text-white dark:bg-red-600 dark:text-white",
  33: "bg-red-700 text-white dark:bg-red-500 dark:text-white",
};

function getShade(pts: number, status: "correct" | "wrong" | "unanswered"): string {
  if (status === "unanswered") {
    return "bg-muted text-muted-foreground border border-dashed border-muted-foreground/40";
  }
  const map = status === "correct" ? CORRECT_SHADES : WRONG_SHADES;
  return map[pts] ?? map[21];
}

export function ScoreCard({
  score,
  total,
  timeTakenSeconds,
  tcfPoints,
  answers,
}: ScoreCardProps) {
  const t = useTranslations();
  const isPointBased = tcfPoints != null;
  const pct = isPointBased
    ? Math.round((tcfPoints / TCF_MAX_SCORE) * 100)
    : total > 0
      ? Math.round((score / total) * 100)
      : 0;
  const tcf = isPointBased
    ? getEstimatedTcfLevel(tcfPoints)
    : getEstimatedTcfLevel(0);
  const displayTcf = useCountUp(isPointBased ? tcfPoints : score, 1400);
  const displayPct = useCountUp(pct, 1400);

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
      <CardContent className="flex flex-col items-center py-8">
        {/* Circular progress ring with score inside */}
        <div className="relative flex items-center justify-center">
          <CircularProgress value={pct} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isPointBased ? (
              <>
                <div className="text-4xl font-bold leading-none">
                  {displayTcf}
                  <span className="text-lg text-muted-foreground">/{TCF_MAX_SCORE}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {displayPct}%
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold leading-none">
                  {displayTcf}
                  <span className="text-lg text-muted-foreground">/{total}</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {displayPct}%
                </div>
              </>
            )}
          </div>
        </div>

        {/* Level badge — pops in after count-up */}
        {isPointBased && (
          <div
            className={cn(
              "mt-4 opacity-0 scale-75 transition-all duration-500 ease-out",
              "animate-badge-pop",
            )}
          >
            <span
              className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${tcf.color} ${tcf.bgColor}`}
            >
              {tcf.level} · {t(`tcfLevels.${tcf.level}.description`)}
            </span>
          </div>
        )}

        {/* Inline TCF score grid */}
        {isPointBased && answers && answers.length > 0 && (() => {
          const answerMap = new Map(answers.map((a) => [a.original_question_number ?? a.question_number, a]));
          return (
          <div className="mt-6 w-full">
            <div className="overflow-x-auto">
              <div className="space-y-1.5 min-w-[360px]">
                {GRID_ROWS.map((row) => {
                  const nums: number[] = [];
                  for (let i = row.range[0]; i <= row.range[1]; i++) nums.push(i);
                  return (
                    <div key={row.range[0]} className="flex gap-1">
                      {nums.map((n) => {
                        const a = answerMap.get(n);
                        const pts = getTcfPoints(n);
                        const isCorrect = a?.is_correct === true;
                        const isWrong = a?.is_correct === false && !!a?.selected;
                        const status = isCorrect ? "correct" : isWrong ? "wrong" : "unanswered";
                        return (
                          <div
                            key={n}
                            className={cn(
                              "flex flex-col items-center justify-center rounded px-1 py-0.5 text-[10px] leading-tight font-medium flex-1 min-w-[32px]",
                              getShade(pts, status),
                            )}
                          >
                            <span>Q{n}</span>
                            <span className="text-[9px] opacity-80">{t('results.reviewItem.points', { points: pts })}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 justify-center">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-green-500" /> {t('results.scoreGrid.correct')}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-red-500" /> {t('results.scoreGrid.wrong')}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm border border-dashed border-muted-foreground/40 bg-muted" /> {t('results.scoreGrid.unanswered')}
              </span>
            </div>
          </div>
          );
        })()}

        {/* Meta info */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            {t('results.scoreCard.answered', { score, total })}
          </span>
          {total - score > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-300 dark:bg-red-400/60" />
              {t('results.scoreCard.wrong', { count: total - score })}
            </span>
          )}
          {timeTakenSeconds != null && timeTakenSeconds > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {t('results.scoreCard.timeUsed', { time: formatTime(timeTakenSeconds) })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTcfPoints, TCF_MAX_SCORE } from "@/lib/tcf-levels";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ReviewAnswer } from "@/lib/api/types";

interface TcfScoreGridProps {
  answers: ReviewAnswer[];
}

/** 按分值区间分组的行定义 */
const ROWS: { label: string; range: [number, number] }[] = [
  { label: "3–9 分", range: [1, 10] },
  { label: "15–21 分", range: [11, 20] },
  { label: "21 分", range: [21, 30] },
  { label: "27–33 分", range: [31, 39] },
];

/**
 * Map points to color classes with depth proportional to weight.
 * Higher points → deeper/more saturated color.
 */
const CORRECT_SHADES: Record<number, string> = {
  3:  "bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-300",
  9:  "bg-green-300 text-green-900 dark:bg-green-800/50 dark:text-green-200",
  15: "bg-green-400 text-white dark:bg-green-700/60 dark:text-green-100",
  21: "bg-green-500 text-white dark:bg-green-600/70 dark:text-green-50",
  27: "bg-green-600 text-white dark:bg-green-600 dark:text-white",
  33: "bg-green-700 text-white dark:bg-green-500 dark:text-white",
};

const WRONG_SHADES: Record<number, string> = {
  3:  "bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300",
  9:  "bg-red-300 text-red-900 dark:bg-red-800/50 dark:text-red-200",
  15: "bg-red-400 text-white dark:bg-red-700/60 dark:text-red-100",
  21: "bg-red-500 text-white dark:bg-red-600/70 dark:text-red-50",
  27: "bg-red-600 text-white dark:bg-red-600 dark:text-white",
  33: "bg-red-700 text-white dark:bg-red-500 dark:text-white",
};

function getShade(pts: number, status: "correct" | "wrong" | "unanswered"): string {
  if (status === "unanswered") {
    return "bg-muted text-muted-foreground border border-dashed border-muted-foreground/40";
  }
  const map = status === "correct" ? CORRECT_SHADES : WRONG_SHADES;
  return map[pts] ?? map[21];
}

export function TcfScoreGrid({ answers }: TcfScoreGridProps) {
  const t = useTranslations();
  const answerMap = new Map(answers.map((a) => [a.question_number, a]));

  let earned = 0;
  for (const a of answers) {
    if (a.is_correct) earned += getTcfPoints(a.question_number);
  }
  const pct = Math.round((earned / TCF_MAX_SCORE) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('results.scoreGrid.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-x-auto">
          <div className="space-y-1.5 min-w-[360px]">
            {ROWS.map((row) => {
              const nums: number[] = [];
              for (let i = row.range[0]; i <= row.range[1]; i++) nums.push(i);
              return (
                <div key={row.label} className="flex gap-1">
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

        {/* Legend + summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" /> {t('results.scoreGrid.correct')}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" /> {t('results.scoreGrid.wrong')}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-dashed border-muted-foreground/40 bg-muted" /> {t('results.scoreGrid.unanswered')}
            </span>
          </div>
          <span className="font-medium text-foreground">
            {t('results.scoreGrid.total', { earned, max: TCF_MAX_SCORE, pct })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

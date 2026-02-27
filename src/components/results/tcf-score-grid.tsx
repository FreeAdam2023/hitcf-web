"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTcfPoints, TCF_MAX_SCORE } from "@/lib/tcf-levels";
import { cn } from "@/lib/utils";
import type { ReviewAnswer } from "@/lib/api/types";

interface TcfScoreGridProps {
  answers: ReviewAnswer[];
}

/** 按分值区间分组的行定义 */
const ROWS: { label: string; range: [number, number] }[] = [
  { label: "3\u201C9 分", range: [1, 10] },
  { label: "15\u201C21 分", range: [11, 20] },
  { label: "21 分", range: [21, 30] },
  { label: "27\u201C33 分", range: [31, 39] },
];

export function TcfScoreGrid({ answers }: TcfScoreGridProps) {
  const answerMap = new Map(answers.map((a) => [a.question_number, a]));

  let earned = 0;
  for (const a of answers) {
    if (a.is_correct) earned += getTcfPoints(a.question_number);
  }
  const pct = Math.round((earned / TCF_MAX_SCORE) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">题目分值一览</CardTitle>
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
                    const isWrong = a?.is_correct === false;
                    return (
                      <div
                        key={n}
                        className={cn(
                          "flex flex-col items-center justify-center rounded px-1 py-0.5 text-[10px] leading-tight font-medium flex-1 min-w-[32px]",
                          isCorrect && "bg-green-500 text-white",
                          isWrong && "bg-red-500 text-white",
                          !isCorrect && !isWrong && "bg-muted text-muted-foreground",
                        )}
                      >
                        <span>Q{n}</span>
                        <span className="text-[9px] opacity-80">{pts}分</span>
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
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" /> 正确
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" /> 错误
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted" /> 未答
            </span>
          </div>
          <span className="font-medium text-foreground">
            {earned} / {TCF_MAX_SCORE} 分 ({pct}%)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScoreCard } from "@/components/results/score-card";
import type { AttemptDetail } from "@/lib/api/types";

interface ResultsViewProps {
  attempt: AttemptDetail;
}

export function ResultsView({ attempt }: ResultsViewProps) {
  const score = attempt.score ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">
        {attempt.mode === "exam" ? "考试成绩" : "练习成绩"}
      </h1>

      <ScoreCard score={score} total={attempt.total} />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">逐题回顾</h2>
        <div className="divide-y rounded-md border">
          {attempt.answers
            .sort((a, b) => a.question_number - b.question_number)
            .map((ans) => (
              <div
                key={ans.question_id}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <span className="w-8 text-muted-foreground">
                  #{ans.question_number}
                </span>
                {ans.is_correct === true && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {ans.is_correct === false && (
                  <X className="h-4 w-4 text-red-500" />
                )}
                {ans.is_correct === null && (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="flex-1">
                  你的选择:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      ans.is_correct === true && "text-green-600",
                      ans.is_correct === false && "text-red-600",
                    )}
                  >
                    {ans.selected || "未作答"}
                  </span>
                </span>
                {ans.is_correct === false && ans.correct_answer && (
                  <span className="text-muted-foreground">
                    正确答案: <span className="font-medium text-green-600">{ans.correct_answer}</span>
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/tests">返回题库</Link>
        </Button>
      </div>
    </div>
  );
}

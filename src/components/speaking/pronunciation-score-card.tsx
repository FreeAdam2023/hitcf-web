"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PronunciationScores } from "@/hooks/use-speech-assessment";

function scoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function scoreTextColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getGrade(score: number): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  if (score >= 90) return { label: "A", variant: "default" };
  if (score >= 70) return { label: "B", variant: "secondary" };
  if (score >= 50) return { label: "C", variant: "outline" };
  return { label: "D", variant: "destructive" };
}

const DIMENSIONS = ["accuracy", "fluency", "completeness", "prosody"] as const;

export function PronunciationScoreCard({ scores }: { scores: PronunciationScores }) {
  const t = useTranslations("speakingPractice");
  const grade = getGrade(scores.overall);

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        {/* Overall score */}
        <div className="flex items-center justify-between">
          <div>
            <span className={cn("text-3xl font-bold", scoreTextColor(scores.overall))}>
              {scores.overall}
            </span>
            <span className="text-sm text-muted-foreground"> / 100</span>
          </div>
          <Badge variant={grade.variant} className="text-sm px-3 py-1">
            {t("grade")} {grade.label}
          </Badge>
        </div>

        {/* Four dimensions */}
        <div className="grid gap-3">
          {DIMENSIONS.map((dim) => {
            const value = scores[dim];
            return (
              <div key={dim} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t(dim)}</span>
                  <span className={cn("text-sm font-semibold", scoreTextColor(value))}>
                    {value}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={cn("h-2 rounded-full transition-all", scoreColor(value))}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

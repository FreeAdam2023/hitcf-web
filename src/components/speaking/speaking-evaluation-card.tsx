"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
import type { SpeakingEvaluationResponse } from "@/lib/api/types";

interface SpeakingEvaluationCardProps {
  evaluation: SpeakingEvaluationResponse;
}

const DIMENSIONS = [
  { key: "prononciation", color: "bg-red-500" },
  { key: "fluidite", color: "bg-orange-500" },
  { key: "grammaire", color: "bg-yellow-500" },
  { key: "vocabulaire", color: "bg-green-500" },
  { key: "accomplissement", color: "bg-blue-500" },
  { key: "adequation_sociolinguistique", color: "bg-purple-500" },
] as const;

export function SpeakingEvaluationCard({
  evaluation,
}: SpeakingEvaluationCardProps) {
  const t = useTranslations("speakingConversation");

  return (
    <div className="space-y-4">
      {/* Score overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("evaluation")}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-base font-bold">
                {evaluation.total_score}/30
              </Badge>
              <Badge>{evaluation.estimated_level}</Badge>
              {evaluation.estimated_nclc && (
                <Badge variant="secondary">
                  NCLC {evaluation.estimated_nclc}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {DIMENSIONS.map(({ key, color }) => {
            const dim = evaluation[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm lg:text-base">
                  <span>{t(`dim.${key}`)}</span>
                  <span className="font-medium">{dim.score}/5</span>
                </div>
                <Progress
                  value={(dim.score / 5) * 100}
                  className="h-2"
                  indicatorClassName={color}
                />
                {dim.feedback && (
                  <p className="text-xs lg:text-sm text-muted-foreground">{dim.feedback}</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Overall comment */}
      {evaluation.overall_comment && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("overallComment")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm lg:text-base leading-relaxed">{evaluation.overall_comment}</p>
          </CardContent>
        </Card>
      )}

      {/* Corrections */}
      {evaluation.corrections.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("corrections")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluation.corrections.map((c, i) => (
                <div key={i} className="rounded-md bg-muted/50 p-3 text-sm lg:text-base">
                  <div className="flex gap-2">
                    <span className="text-destructive line-through">
                      {c.original}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {c.corrected}
                    </span>
                  </div>
                  <p className="mt-1 text-xs lg:text-sm text-muted-foreground">
                    {c.explanation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vocab suggestions */}
      {evaluation.vocab_suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("vocabSuggestions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluation.vocab_suggestions.map((v, i) => (
                <div key={i} className="rounded-md bg-muted/50 p-3 text-sm lg:text-base">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">{v.original}</span>
                    <span>→</span>
                    <span className="font-medium text-primary">
                      {v.suggestion}
                    </span>
                  </div>
                  <p className="mt-1 text-xs lg:text-sm text-muted-foreground">
                    {v.reason}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

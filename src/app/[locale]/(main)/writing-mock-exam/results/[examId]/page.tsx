"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, RotateCcw, Trophy, BarChart3, BrainCircuit, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { getWritingExam } from "@/lib/api/writing-exam";
import type { WritingExamDetail, WritingExamTask } from "@/lib/api/writing-exam";

function ScoreBadge({ score, max = 20 }: { score: number; max?: number }) {
  const pct = score / max;
  let color = "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
  if (pct >= 0.8) color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
  else if (pct >= 0.6) color = "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
  else if (pct >= 0.4) color = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
  else if (pct >= 0.25) color = "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-lg font-bold ${color}`}>
      {score}/{max}
    </span>
  );
}

function DimensionBar({ label, score }: { label: string; score: number }) {
  const pct = Math.min(100, (score / 5) * 100);
  let barColor = "bg-red-500";
  if (pct >= 80) barColor = "bg-emerald-500";
  else if (pct >= 60) barColor = "bg-blue-500";
  else if (pct >= 40) barColor = "bg-amber-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{score}/5</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TaskResultCard({ task, t }: { task: WritingExamTask; t: (key: string) => string }) {
  const fb = task.feedback;
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tâche {task.task_number}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{task.word_count} {t("words")}</Badge>
            {fb && <Badge variant="outline">{fb.total_score}/20</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {fb ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <DimensionBar label={t("dim.adequation")} score={fb.adequation.score} />
              <DimensionBar label={t("dim.coherence")} score={fb.coherence.score} />
              <DimensionBar label={t("dim.vocabulaire")} score={fb.vocabulaire.score} />
              <DimensionBar label={t("dim.grammaire")} score={fb.grammaire.score} />
            </div>
            {fb.overall_comment && (
              <p className="text-sm text-muted-foreground">{fb.overall_comment}</p>
            )}
            {fb.corrections.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground">{t("corrections")}</h4>
                {fb.corrections.slice(0, 5).map((c, i) => (
                  <div key={i} className="rounded border p-2 text-xs">
                    <span className="line-through text-red-500">{c.original}</span>
                    {" → "}
                    <span className="text-emerald-600">{c.corrected}</span>
                    <p className="mt-0.5 text-muted-foreground">{c.explanation}</p>
                  </div>
                ))}
              </div>
            )}
            {fb.vocab_suggestions.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground">{t("vocabSuggestions")}</h4>
                {fb.vocab_suggestions.map((v, i) => (
                  <div key={i} className="rounded border p-2 text-xs">
                    <span className="text-muted-foreground">{v.original}</span>
                    {" → "}
                    <span className="font-medium text-primary">{v.suggestion}</span>
                    <p className="mt-0.5 text-muted-foreground">{v.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noEvaluation")}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function WritingExamResultsPage() {
  const t = useTranslations("writingMockExam");
  const router = useRouter();
  const params = useParams<{ examId: string }>()!;
  const [exam, setExam] = useState<WritingExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWritingExam(params.examId)
      .then(setExam)
      .catch(() => setExam(null))
      .finally(() => setLoading(false));
  }, [params.examId]);

  if (loading) return <LoadingSpinner />;
  if (!exam) return <div className="py-16 text-center text-muted-foreground">{t("notFound")}</div>;

  const dateStr = new Date(exam.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 sm:px-0">
      <Breadcrumb items={[
        { label: t("backToExam"), href: "/writing-mock-exam" },
        { label: t("examResults") },
      ]} />

      {/* Overall score */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <CardTitle className="text-xl">{t("examResults")}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{dateStr}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6 py-4">
            {exam.total_score !== null && (
              <div className="text-center">
                <ScoreBadge score={exam.total_score} max={60} />
                <p className="mt-1 text-xs text-muted-foreground">{t("totalScoreLabel")}</p>
              </div>
            )}
            {exam.tcf_score !== null && (
              <div className="text-center">
                <ScoreBadge score={exam.tcf_score} />
                <p className="mt-1 text-xs text-muted-foreground">TCF /20</p>
              </div>
            )}
            {exam.estimated_level && (
              <div className="text-center">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-lg font-bold text-primary">
                  {exam.estimated_level}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">CEFR</p>
              </div>
            )}
            {exam.estimated_nclc && (
              <div className="text-center">
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                  {exam.estimated_nclc}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">NCLC</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Feedback */}
      {exam.ai_feedback && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{t("aiFeedback")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{exam.ai_feedback}</div>
          </CardContent>
        </Card>
      )}

      {/* Per-tâche results */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">{t("perTaskResults")}</h2>
      </div>
      {exam.tasks.map((task) => (
        <TaskResultCard key={task.task_number} task={task} t={t} />
      ))}

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Button variant="outline" onClick={() => router.push("/writing-mock-exam")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToExam")}
        </Button>
        <Button onClick={() => router.push("/writing-mock-exam")}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("tryAgain")}
        </Button>
        <Button variant="outline" onClick={() => router.push("/writing-mock-exam/history")}>
          <History className="mr-2 h-4 w-4" />
          {t("viewHistory")}
        </Button>
      </div>
    </div>
  );
}

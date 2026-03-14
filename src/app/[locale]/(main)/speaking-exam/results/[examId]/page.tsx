"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Clock,
  BarChart3,
  MessageSquare,
  BrainCircuit,
  History,
} from "lucide-react";
import { useCelebration } from "@/hooks/use-celebration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { getSpeakingExam } from "@/lib/api/speaking-exam";
import type { SpeakingExamDetail, TacheSummary } from "@/lib/api/speaking-exam";

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
  if (score >= 16) color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
  else if (score >= 12) color = "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
  else if (score >= 8) color = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
  else if (score >= 5) color = "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-lg font-bold ${color}`}>
      {score.toFixed(1)}/20
    </span>
  );
}

function DimensionBar({ label, score, max = 5 }: { label: string; score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  let barColor = "bg-red-500";
  if (pct >= 80) barColor = "bg-emerald-500";
  else if (pct >= 60) barColor = "bg-blue-500";
  else if (pct >= 40) barColor = "bg-amber-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm lg:text-base">
        <span>{label}</span>
        <span className="font-medium">{score}/5</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TacheResultCard({
  tache,
  tacheNumber,
  t,
}: {
  tache: TacheSummary | null;
  tacheNumber: number;
  t: (key: string) => string;
}) {
  if (!tache) return null;
  const ev = tache.evaluation;
  const durationMin = Math.floor(tache.duration_seconds / 60);
  const durationSec = tache.duration_seconds % 60;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tâche {tacheNumber}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{tache.turn_count} {t("turns")}</Badge>
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              {durationMin}m {durationSec}s
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {ev ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <DimensionBar label={t("dim.prononciation")} score={ev.prononciation.score} />
              <DimensionBar label={t("dim.fluidite")} score={ev.fluidite.score} />
              <DimensionBar label={t("dim.grammaire")} score={ev.grammaire.score} />
              <DimensionBar label={t("dim.vocabulaire")} score={ev.vocabulaire.score} />
              <DimensionBar label={t("dim.accomplissement")} score={ev.accomplissement.score} />
              <DimensionBar label={t("dim.adequation")} score={ev.adequation_sociolinguistique.score} />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
              <span className="text-sm font-medium">{t("tacheScore")}</span>
              <span className="font-bold">{ev.total_score}/30</span>
            </div>
            {ev.overall_comment && (
              <p className="text-sm lg:text-base text-muted-foreground">{ev.overall_comment}</p>
            )}
          </>
        ) : (
          <p className="text-sm lg:text-base text-muted-foreground">{t("noEvaluation")}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ReplayPanel({ tache, t }: { tache: TacheSummary | null; tacheNumber: number; t: (key: string) => string }) {
  if (!tache?.turns?.length) {
    return <p className="py-4 text-center text-sm lg:text-base text-muted-foreground">{t("noEvaluation")}</p>;
  }
  return (
    <div className="space-y-2 py-2">
      {tache.turns.map((turn, i) => (
        <div
          key={i}
          className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm lg:text-base ${
              turn.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            {turn.text}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SpeakingExamResultsPage() {
  const t = useTranslations("speakingExam");
  const router = useRouter();
  const params = useParams<{ examId: string }>()!;
  const [exam, setExam] = useState<SpeakingExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Celebration: total_score out of 20
  const celebrationPct = exam?.total_score != null ? Math.round((exam.total_score / 20) * 100) : undefined;
  useCelebration(celebrationPct);

  useEffect(() => {
    getSpeakingExam(params.examId, { include_turns: true })
      .then(setExam)
      .catch(() => setExam(null))
      .finally(() => setLoading(false));
  }, [params.examId]);

  if (loading) return <LoadingSpinner />;

  if (!exam) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t("notFound")}
      </div>
    );
  }

  const createdAt = new Date(exam.created_at);
  const dateStr = createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 sm:px-0">
      <Breadcrumb
        items={[
          { label: t("backToExam"), href: "/speaking-exam" },
          { label: t("examResults") },
        ]}
      />

      {/* Overall score */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <CardTitle className="text-xl">{t("examResults")}</CardTitle>
              <p className="mt-1 text-sm lg:text-base text-muted-foreground">{dateStr}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6 py-4">
            {exam.total_score !== null && (
              <div className="text-center">
                <ScoreBadge score={exam.total_score} />
                <p className="mt-1 text-xs text-muted-foreground">TCF Score</p>
              </div>
            )}
            {exam.estimated_level && (
              <div className="text-center">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-lg font-bold text-primary">
                  {exam.estimated_level}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">CEFR Level</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-tâche results */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">{t("perTacheResults")}</h2>
      </div>

      <TacheResultCard tache={exam.tache1} tacheNumber={1} t={t} />
      <TacheResultCard tache={exam.tache2} tacheNumber={2} t={t} />
      <TacheResultCard tache={exam.tache3} tacheNumber={3} t={t} />

      {/* AI Feedback */}
      {exam.ai_feedback && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{t("aiFeedback")}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">{t("aiFeedbackDesc")}</p>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm lg:text-base leading-relaxed">
              {exam.ai_feedback}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Replay */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">{t("replay")}</h2>
      </div>
      <Card>
        <CardContent className="pt-4">
          <Tabs defaultValue="t1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="t1">Tâche 1</TabsTrigger>
              <TabsTrigger value="t2">Tâche 2</TabsTrigger>
              <TabsTrigger value="t3">Tâche 3</TabsTrigger>
            </TabsList>
            <TabsContent value="t1">
              <ReplayPanel tache={exam.tache1} tacheNumber={1} t={t} />
            </TabsContent>
            <TabsContent value="t2">
              <ReplayPanel tache={exam.tache2} tacheNumber={2} t={t} />
            </TabsContent>
            <TabsContent value="t3">
              <ReplayPanel tache={exam.tache3} tacheNumber={3} t={t} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Button variant="outline" onClick={() => router.push("/speaking-exam")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToExam")}
        </Button>
        <Button onClick={() => router.push("/speaking-exam")}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("tryAgain")}
        </Button>
        <Button variant="outline" onClick={() => router.push("/speaking-exam/history")}>
          <History className="mr-2 h-4 w-4" />
          {t("viewHistory")}
        </Button>
      </div>
    </div>
  );
}

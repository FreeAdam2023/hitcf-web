"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Clock, FileText, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTestSet } from "@/lib/api/test-sets";
import { createAttempt } from "@/lib/api/attempts";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { TestSetDetail } from "@/lib/api/types";

export default function ExamStartPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ testSetId: string }>()!;
  const searchParams = useSearchParams();
  const forceNew = searchParams.get("forceNew") === "1";
  const [testSet, setTestSet] = useState<TestSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getTestSet(params.testSetId)
      .then(setTestSet)
      .catch(() => router.replace("/tests"))
      .finally(() => setLoading(false));
  }, [params.testSetId, router]);

  const handleStart = async () => {
    if (!testSet) return;
    setStarting(true);
    try {
      const attempt = await createAttempt(
        { test_set_id: testSet.id, mode: "exam" },
        forceNew ? { forceNew: true } : undefined,
      );
      router.replace(`/exam/${attempt.id}`);
    } catch {
      toast.error(t("common.errors.createExamFailed"));
      setStarting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!testSet) return null;

  const isListening = testSet.type === "listening";
  const minutes = testSet.time_limit_minutes || (isListening ? 35 : 60);
  const questionCount = testSet.question_count || 39;
  const frenchTitle = isListening ? "Compréhension orale" : "Compréhension écrite";

  const consigneKeys = isListening
    ? ["listeningConsigne1", "listeningConsigne2", "listeningConsigne3"]
    : ["readingConsigne1", "readingConsigne2", "readingConsigne3"];

  const levelKeys = isListening
    ? ["listeningLevel1", "listeningLevel2", "listeningLevel3"]
    : ["readingLevel1", "readingLevel2", "readingLevel3"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary">
          {frenchTitle}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold">
          {isListening ? t("exam.session.listeningTitle") : t("exam.session.readingTitle")}
        </h2>
        <p className="text-muted-foreground">
          {isListening ? t("exam.session.listeningDesc") : t("exam.session.readingDesc")}
        </p>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl border bg-card p-3">
          <FileText className="h-5 w-5 text-primary mb-1" />
          <span className="text-lg font-bold">{questionCount}</span>
          <span className="text-[11px] text-muted-foreground">{t("exam.session.introQuestions")}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-3">
          <Clock className="h-5 w-5 text-primary mb-1" />
          <span className="text-lg font-bold">{minutes}</span>
          <span className="text-[11px] text-muted-foreground">{t("exam.session.introMinutes")}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-3">
          <ArrowRight className="h-5 w-5 text-primary mb-1" />
          <span className="text-lg font-bold">A1→C2</span>
          <span className="text-[11px] text-muted-foreground">{t("exam.session.introProgressive")}</span>
        </div>
      </div>

      {/* Rules card */}
      <div className="mt-6 rounded-xl border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">{t("exam.session.introRulesTitle")}</h3>
        <div className="space-y-2.5 text-sm text-muted-foreground">
          {consigneKeys.map((key, i) => (
            <div key={key} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
              <span>{t(`exam.session.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="mt-4 rounded-xl border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">{t("exam.session.introDifficultyTitle")}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">A1–A2</span>
            <span className="text-muted-foreground">{t(`exam.session.${levelKeys[0]}`)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">B1–B2</span>
            <span className="text-muted-foreground">{t(`exam.session.${levelKeys[1]}`)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">C1–C2</span>
            <span className="text-muted-foreground">{t(`exam.session.${levelKeys[2]}`)}</span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          {isListening
            ? t("exam.session.listeningWarning", { minutes })
            : t("exam.session.readingWarning", { minutes })}
        </span>
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <Button
          size="lg"
          className="w-full sm:w-auto sm:min-w-[200px]"
          disabled={starting}
          onClick={handleStart}
        >
          {starting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.actions.starting")}</>
          ) : (
            t("exam.session.startReading")
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => router.push("/tests")}
        >
          {t("exam.session.exitExam")}
        </Button>
      </div>
    </div>
  );
}

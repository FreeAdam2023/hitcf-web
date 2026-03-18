"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mic, Clock, Trophy, History, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { startSpeakingExam, checkFreeTrialEligible } from "@/lib/api/speaking-exam";

type QuestionRange = "1m" | "3m" | "all";

const RANGE_OPTIONS: { value: QuestionRange; labelKey: string }[] = [
  { value: "1m", labelKey: "range1m" },
  { value: "3m", labelKey: "range3m" },
  { value: "all", labelKey: "rangeAll" },
];

export default function SpeakingExamPage() {
  const t = useTranslations("speakingExam");
  const router = useRouter();
  const [range, setRange] = useState<QuestionRange>("1m");
  const [loading, setLoading] = useState(false);
  const [freeTrialEligible, setFreeTrialEligible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("speakingExamRange") as QuestionRange | null;
    if (stored) setRange(stored);
    checkFreeTrialEligible().then((r) => setFreeTrialEligible(r.eligible)).catch(() => {});
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("speakingExamRange", range);
      }
      const result = await startSpeakingExam({ range });
      router.push(`/speaking-exam/${result.exam_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("startFailed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-0">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Mic className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Exam format */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("examFormat")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { tache: "Tâche 1", nameKey: "tache1Name", timeKey: "tache1Time", icon: "1" },
            { tache: "Tâche 2", nameKey: "tache2Name", timeKey: "tache2Time", icon: "2" },
            { tache: "Tâche 3", nameKey: "tache3Name", timeKey: "tache3Time", icon: "3" },
          ].map((item) => (
            <div key={item.tache} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.tache}</span>
                  <Badge variant="secondary" className="text-xs">{t(item.nameKey)}</Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {t(item.timeKey)}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            {t("totalTime")}
          </div>
        </CardContent>
      </Card>

      {/* Range selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("topicRange")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
                  range === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("rangeDesc")}
          </p>
        </CardContent>
      </Card>

      {/* Free trial */}
      {freeTrialEligible && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardContent className="flex items-center gap-3 py-4">
            <Gift className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-emerald-700 dark:text-emerald-300">{t("freeTrial")}</span>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">{t("freeTrialBadge")}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("freeTrialDesc")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start button */}
      <Button
        size="lg"
        className="w-full text-lg"
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? t("starting") : t("startExam")}
      </Button>

      <Button variant="ghost" className="w-full" onClick={() => router.push("/speaking-exam/history")}>
        <History className="mr-2 h-4 w-4" />
        {t("viewHistory")}
      </Button>
    </div>
  );
}

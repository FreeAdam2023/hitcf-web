"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PenLine, Clock, FileText, AlertTriangle, History, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { startWritingExam, checkWritingFreeTrialEligible } from "@/lib/api/writing-exam";

type QuestionRange = "1m" | "3m" | "all";

const RANGE_OPTIONS: { value: QuestionRange; labelKey: string }[] = [
  { value: "1m", labelKey: "range1m" },
  { value: "3m", labelKey: "range3m" },
  { value: "all", labelKey: "rangeAll" },
];

export default function WritingMockExamPage() {
  const t = useTranslations("writingMockExam");
  const router = useRouter();
  const [range, setRange] = useState<QuestionRange>("1m");
  const [loading, setLoading] = useState(false);
  const [freeTrialEligible, setFreeTrialEligible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("writingExamRange") as QuestionRange | null;
    if (stored) setRange(stored);
    checkWritingFreeTrialEligible().then((r) => setFreeTrialEligible(r.eligible)).catch(() => {});
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("writingExamRange", range);
      }
      const result = await startWritingExam({ range });
      router.push(`/writing-mock-exam/${result.exam_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("startFailed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary">
          Expression écrite
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl border bg-card p-3">
          <FileText className="h-5 w-5 text-primary mb-1" />
          <span className="text-lg font-bold">3</span>
          <span className="text-[11px] text-muted-foreground">{t("statsTaches")}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-3">
          <Clock className="h-5 w-5 text-primary mb-1" />
          <span className="text-lg font-bold">60</span>
          <span className="text-[11px] text-muted-foreground">{t("statsMinutes")}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-3">
          <PenLine className="h-5 w-5 text-primary mb-1" />
          <span className="text-lg font-bold">A1→C2</span>
          <span className="text-[11px] text-muted-foreground">{t("statsProgressive")}</span>
        </div>
      </div>

      {/* Tâche breakdown */}
      <div className="mt-6 rounded-xl border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">{t("examFormat")}</h3>
        <div className="space-y-2.5">
          {[
            { icon: "1", nameKey: "tache1Name", wordsKey: "tache1Words", level: "A1–A2" },
            { icon: "2", nameKey: "tache2Name", wordsKey: "tache2Words", level: "B1–B2" },
            { icon: "3", nameKey: "tache3Name", wordsKey: "tache3Words", level: "B2–C2" },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Tâche {item.icon}</span>
                  <Badge variant="secondary" className="text-[10px]">{t(item.nameKey)}</Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <PenLine className="h-3 w-3" /> {t(item.wordsKey)}
                </div>
              </div>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{item.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Topic range selector */}
      <div className="mt-4 rounded-xl border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">{t("topicRange")}</h3>
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
        <p className="text-xs text-muted-foreground">{t("rangeDesc")}</p>
      </div>

      {/* Free trial */}
      {freeTrialEligible && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <Gift className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-emerald-700 dark:text-emerald-300">{t("freeTrial")}</span>
              <Badge className="bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-900 dark:text-emerald-300">{t("freeTrialBadge")}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("freeTrialDesc")}</p>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{t("warning")}</span>
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px]" onClick={handleStart} disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("starting")}</>
          ) : (
            t("startExam")
          )}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => router.push("/writing-mock-exam/history")}>
          <History className="mr-2 h-4 w-4" />
          {t("viewHistory")}
        </Button>
      </div>
    </div>
  );
}

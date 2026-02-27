"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  FileText,
  Lock,
  Headphones,
  BookOpen,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { createAttempt, getActiveAttempt } from "@/lib/api/attempts";
import { cn } from "@/lib/utils";
import { TYPE_COLORS } from "@/lib/constants";
import type { TestSetItem, ActiveAttemptResponse } from "@/lib/api/types";

export interface TestAttemptInfo {
  bestScore: number | null;
  bestTotal: number;
  hasInProgress: boolean;
  attemptCount: number;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
};

export function TestCard({
  test,
  attemptInfo,
}: {
  test: TestSetItem;
  attemptInfo?: TestAttemptInfo;
}) {
  const t = useTranslations();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const locked = !test.is_free && !canAccessPaid;

  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startingExam, setStartingExam] = useState(false);

  // Active attempt state (fetched when dialog opens)
  const [activePractice, setActivePractice] = useState<ActiveAttemptResponse | null>(null);
  const [activeExam, setActiveExam] = useState<ActiveAttemptResponse | null>(null);

  // Fetch active attempts when dialog opens
  useEffect(() => {
    if (!open || locked || !isAuthenticated) return;

    setActivePractice(null);
    setActiveExam(null);

    Promise.all([
      getActiveAttempt(test.id, "practice").catch(() => null),
      getActiveAttempt(test.id, "exam").catch(() => null),
    ]).then(([practice, exam]) => {
      setActivePractice(practice ?? null);
      setActiveExam(exam ?? null);
    });
  }, [open, test.id, locked, isAuthenticated]);

  const handleLockedClick = () => router.push("/pricing");
  const handleLockedKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push("/pricing");
    }
  };

  // ── Practice handlers ──
  const handleContinuePractice = () => {
    router.push(`/practice/${activePractice!.id}`);
  };

  const handleStartPractice = async (forceNew = false) => {
    setStarting(true);
    try {
      const attempt = await createAttempt(
        { test_set_id: test.id, mode: "practice" },
        forceNew ? { forceNew: true } : undefined,
      );
      router.push(`/practice/${attempt.id}`);
    } catch {
      toast.error(t("common.errors.createPracticeFailed"));
      setStarting(false);
    }
  };

  // ── Exam handlers ──
  const handleContinueExam = () => {
    router.push(`/exam/${activeExam!.id}`);
  };

  const handleStartExam = async (forceNew = false) => {
    setStartingExam(true);
    try {
      const attempt = await createAttempt(
        { test_set_id: test.id, mode: "exam" },
        forceNew ? { forceNew: true } : undefined,
      );
      router.push(`/exam/${attempt.id}`);
    } catch {
      toast.error(t("common.errors.createExamFailed"));
      setStartingExam(false);
    }
  };

  const colors = TYPE_COLORS[test.type];
  const Icon = TYPE_ICONS[test.type] || FileText;

  // Progress display
  const hasCompleted = attemptInfo?.bestScore !== null && attemptInfo?.bestScore !== undefined;
  const hasInProgress = attemptInfo?.hasInProgress && !hasCompleted;
  const bestPct = hasCompleted
    ? Math.round((attemptInfo!.bestScore! / attemptInfo!.bestTotal) * 100)
    : null;

  // Extract number from test name for watermark (e.g. "听力测试 3" → "3")
  const testNum = test.name.match(/\d+/)?.[0];

  return (
    <>
      <Card
        className={cn(
          "group relative flex flex-col overflow-hidden card-interactive cursor-pointer",
          locked && "opacity-75",
        )}
        onClick={locked ? handleLockedClick : () => setOpen(true)}
        {...(locked
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": `${test.name} — ${t("testCard.subscribeUnlock")}`,
              onKeyDown: handleLockedKeyDown,
            }
          : {
              role: "button",
              tabIndex: 0,
              "aria-label": test.name,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(true);
                }
              },
            })}
      >
        {/* Large watermark number */}
        {testNum && (
          <span className="absolute -right-2 -top-3 text-[72px] font-black leading-none text-foreground/[0.04] select-none pointer-events-none">
            {testNum}
          </span>
        )}

        {/* Subtle gradient wash */}
        {colors?.wash && (
          <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", colors.wash)} />
        )}

        <CardHeader className="relative pb-2 pt-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              hasCompleted
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                : colors?.iconBg,
            )}>
              {hasCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : locked ? (
                <Lock className="h-5 w-5" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-tight">{test.name}</CardTitle>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{t("common.questions", { count: test.question_count })}</span>
                <span>{t("common.time.minutes", { minutes: test.time_limit_minutes })}</span>
                {(attemptInfo?.attemptCount ?? 0) > 0 && (
                  <span>{t("testCard.attempts", { count: attemptInfo!.attemptCount })}</span>
                )}
              </div>
            </div>
            {test.is_free ? (
              <Badge variant="secondary" className="shrink-0">
                {t("common.status.free")}
              </Badge>
            ) : locked ? (
              <Badge variant="outline" className="shrink-0 gap-1 text-muted-foreground">
                <Lock className="h-3 w-3" />
              </Badge>
            ) : (
              <Badge className="shrink-0 bg-gradient-to-r from-primary to-violet-500 text-white text-[10px] px-1.5 py-0 border-0">
                PRO
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative pt-0 pb-4">
          {/* Progress: completed */}
          {hasCompleted && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {t("testCard.best", { score: attemptInfo!.bestScore!, total: attemptInfo!.bestTotal, pct: bestPct! })}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(bestPct ?? 0, 100)}%` }}
                />
              </div>
            </div>
          )}
          {/* Progress: in-progress */}
          {hasInProgress && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-600 dark:text-amber-400">{t("common.status.inProgress")}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-amber-400 animate-[shimmer_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
          )}
          {/* Default: not started */}
          {!hasCompleted && !hasInProgress && !locked && (
            <div className="h-1.5 w-full rounded-full bg-muted" />
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colors?.iconBg)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{test.name}</DialogTitle>
                <DialogDescription>
                  {t("common.questionsWithMinutes", { count: test.question_count, minutes: test.time_limit_minutes })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-lg bg-muted/50 p-3.5 text-xs leading-relaxed text-muted-foreground space-y-1">
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong className="text-foreground">{t("testCard.practiceMode")}</strong>{t("testCard.practiceDesc")}</li>
              <li><strong className="text-foreground">{t("testCard.examMode")}</strong>{t("testCard.examDesc")}</li>
            </ul>
          </div>

          {/* Active attempt notices */}
          {activePractice && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <span className="text-muted-foreground">
                {t("testCard.incompletePractice", { answered: `${activePractice.answered_count}/${activePractice.total}` })}
              </span>
            </div>
          )}

          {activeExam && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
              <span className="text-muted-foreground">
                {t("testCard.incompleteExam", { answered: `${activeExam.answered_count}/${activeExam.total}` })}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <div className="flex gap-3">
              {activePractice ? (
                <Button
                  className="flex-1"
                  onClick={handleContinuePractice}
                  disabled={starting || startingExam}
                >
                  {t("testCard.continuePractice")}
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => handleStartPractice()}
                  disabled={starting || startingExam}
                >
                  {starting ? t("common.actions.starting") : t("testCard.startPractice")}
                </Button>
              )}

              {activeExam ? (
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={handleContinueExam}
                  disabled={starting || startingExam}
                >
                  {t("testCard.continueExam")}
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => handleStartExam()}
                  disabled={starting || startingExam}
                >
                  {startingExam ? t("common.actions.starting") : t("testCard.startExam")}
                </Button>
              )}
            </div>

            {/* Restart options */}
            {(activePractice || activeExam) && (
              <div className="flex gap-3">
                {activePractice ? (
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    onClick={() => handleStartPractice(true)}
                    disabled={starting || startingExam}
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t("testCard.restartPractice")}
                  </button>
                ) : (
                  <div className="flex-1" />
                )}
                {activeExam ? (
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    onClick={() => handleStartExam(true)}
                    disabled={starting || startingExam}
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t("testCard.restartExam")}
                  </button>
                ) : (
                  <div className="flex-1" />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

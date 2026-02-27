"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Layers, Lock, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import {
  createWritingAttempt,
  getActiveWritingAttempt,
} from "@/lib/api/writing-attempts";
import { cn } from "@/lib/utils";
import type { TestSetItem, WritingAttemptResponse } from "@/lib/api/types";

export function WritingTopicCard({ test }: { test: TestSetItem }) {
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
  const [activePractice, setActivePractice] = useState<WritingAttemptResponse | null>(null);
  const [activeExam, setActiveExam] = useState<WritingAttemptResponse | null>(null);

  const numMatch = test.name.match(/(\d+)/);
  const num = numMatch ? numMatch[1] : "";

  // Fetch active attempts when dialog opens
  useEffect(() => {
    if (!open || locked || !isAuthenticated) return;

    setActivePractice(null);
    setActiveExam(null);

    Promise.all([
      getActiveWritingAttempt(test.id, "practice").catch(() => null),
      getActiveWritingAttempt(test.id, "exam").catch(() => null),
    ]).then(([practice, exam]) => {
      setActivePractice(practice ?? null);
      setActiveExam(exam ?? null);
    });
  }, [open, test.id, locked, isAuthenticated]);

  const handleContinuePractice = () => {
    router.push(`/writing-practice/${activePractice!.id}`);
  };

  const handleStartPractice = async (forceNew = false) => {
    setStarting(true);
    try {
      const attempt = await createWritingAttempt(
        { test_set_id: test.id, mode: "practice" },
        forceNew ? { forceNew: true } : undefined,
      );
      router.push(`/writing-practice/${attempt.id}`);
    } catch {
      toast.error(t("common.errors.createPracticeFailed"));
      setStarting(false);
    }
  };

  const handleContinueExam = () => {
    router.push(`/writing-exam/${activeExam!.id}`);
  };

  const handleStartExam = async (forceNew = false) => {
    setStartingExam(true);
    try {
      const attempt = await createWritingAttempt(
        { test_set_id: test.id, mode: "exam" },
        forceNew ? { forceNew: true } : undefined,
      );
      router.push(`/writing-exam/${attempt.id}`);
    } catch {
      toast.error(t("common.errors.createExamFailed"));
      setStartingExam(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "group relative flex flex-col overflow-hidden card-interactive cursor-pointer",
          locked && "opacity-75",
        )}
        onClick={locked ? () => router.push("/pricing") : () => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`Combinaison ${num}`}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (locked) router.push("/pricing");
            else setOpen(true);
          }
        }}
      >
        {num && (
          <span className="absolute -right-2 -top-3 text-[72px] font-black leading-none text-foreground/[0.04] select-none pointer-events-none">
            {num}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-violet-500/[0.02] to-transparent pointer-events-none" />

        <CardHeader className="relative pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <PenLine className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-tight">
                Combinaison {num}
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tache 1 + 2 + 3
              </p>
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
        <CardContent className="relative flex flex-1 flex-col justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              {t("tests.tasksCount", { count: test.question_count })}
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                <PenLine className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Combinaison {num}</DialogTitle>
                <DialogDescription>
                  {t("writingExam.modeDialog.subtitle")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-lg bg-muted/50 p-3.5 text-xs leading-relaxed text-muted-foreground space-y-1">
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong className="text-foreground">{t("writingExam.modeDialog.practiceLabel")}</strong>{t("writingExam.modeDialog.practiceDesc")}</li>
              <li><strong className="text-foreground">{t("writingExam.modeDialog.examLabel")}</strong>{t("writingExam.modeDialog.examDesc")}</li>
            </ul>
          </div>

          {/* Active attempt notices */}
          {activePractice && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <span className="text-muted-foreground">
                {t("writingExam.modeDialog.incompletePractice")}
              </span>
            </div>
          )}

          {activeExam && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
              <span className="text-muted-foreground">
                {t("writingExam.modeDialog.incompleteExam")}
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { PenLine, Lock, RotateCcw } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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
import { cn, isLatestMonth } from "@/lib/utils";
import type { WritingTopicItem, WritingAttemptResponse } from "@/lib/api/types";

const FRENCH_MONTHS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatDialogTitle(topic: WritingTopicItem, locale: string): string {
  const topicName = locale === "zh" && topic.topic_zh ? topic.topic_zh : topic.topic;
  const parts: string[] = [];

  if (topic.source_date) {
    const [year, month] = topic.source_date.split("-");
    parts.push(year);
    const m = parseInt(month, 10);
    if (locale === "zh") {
      parts.push(`${m}月`);
    } else {
      parts.push(FRENCH_MONTHS[m] || month);
    }
  }

  if (topicName) {
    parts.push(topicName);
  }

  return parts.length > 0 ? parts.join(" · ") : topic.test_set_name;
}

export function WritingLevelCard({
  topic,
  tache,
  latestMonth,
}: {
  topic: WritingTopicItem;
  tache: number;
  latestMonth: string | null;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const isFreePreview = isLatestMonth(topic.source_date, latestMonth);
  const locked = !isFreePreview && !canAccessPaid;

  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [activePractice, setActivePractice] = useState<WritingAttemptResponse | null>(null);

  const preview =
    topic.question_text && topic.question_text.length > 120
      ? topic.question_text.slice(0, 120) + "..."
      : topic.question_text || "";

  // Fetch active attempts when dialog opens
  useEffect(() => {
    if (!open || locked || !isAuthenticated) return;

    setActivePractice(null);

    getActiveWritingAttempt(topic.test_set_id, "practice")
      .then((practice) => setActivePractice(practice ?? null))
      .catch(() => null);
  }, [open, topic.test_set_id, locked, isAuthenticated]);

  const taskQuery = `?task=${tache}`;

  const handleContinuePractice = () => {
    router.push(`/writing-practice/${activePractice!.id}${taskQuery}`);
  };

  const handleStartPractice = async (forceNew = false) => {
    setStarting(true);
    try {
      const attempt = await createWritingAttempt(
        { test_set_id: topic.test_set_id, mode: "practice" },
        forceNew ? { forceNew: true } : undefined,
      );
      router.push(`/writing-practice/${attempt.id}${taskQuery}`);
    } catch {
      toast.error(t("common.errors.createPracticeFailed"));
      setStarting(false);
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
        aria-label={t("tests.tacheLabel", { n: tache })}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (locked) router.push("/pricing");
            else setOpen(true);
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-violet-500/[0.02] to-transparent pointer-events-none" />

        <CardHeader className="relative pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <PenLine className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium leading-tight text-muted-foreground">
                {t("tests.tacheLabel", { n: tache })}
                {topic.word_limit && (
                  <span className="ml-2 text-xs text-muted-foreground/70">
                    {t("tests.wordLimit", { range: topic.word_limit })}
                  </span>
                )}
              </CardTitle>
              {(topic.topic || topic.topic_zh) && (
                <p className="mt-1 text-sm font-semibold leading-snug line-clamp-2">
                  {locale === "zh" && topic.topic_zh ? topic.topic_zh : topic.topic}
                </p>
              )}
            </div>
            {isFreePreview ? (
              !canAccessPaid ? (
                <Badge variant="secondary" className="shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {t("tests.freeThisMonth")}
                </Badge>
              ) : null
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
          <p className={cn("line-clamp-3 text-sm leading-relaxed", locked && "select-none blur-[6px]")}>{preview}</p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                <PenLine className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>
                  {formatDialogTitle(topic, locale)}
                </DialogTitle>
                <DialogDescription>
                  Tâche {tache}{topic.word_limit ? ` · ${topic.word_limit} mots` : ""}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-lg bg-muted/50 p-3.5 text-xs leading-relaxed text-muted-foreground">
            <p>{t("writingExam.modeDialog.practiceDesc")}</p>
          </div>

          {activePractice && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <span className="text-muted-foreground">
                {t("writingExam.modeDialog.incompletePractice")}
              </span>
            </div>
          )}

          <div className="space-y-2">
            {activePractice ? (
              <Button
                className="w-full"
                onClick={handleContinuePractice}
                disabled={starting}
              >
                {t("testCard.continuePractice")}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleStartPractice()}
                disabled={starting}
              >
                {starting ? t("common.actions.starting") : t("testCard.startPractice")}
              </Button>
            )}

            {activePractice && (
              <button
                className="w-full inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                onClick={() => handleStartPractice(true)}
                disabled={starting}
              >
                <RotateCcw className="h-3 w-3" />
                {t("testCard.restartPractice")}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

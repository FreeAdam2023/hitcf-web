"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Clock, Save, Send, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getWritingExam,
  saveWritingExamEssays,
  completeWritingExam,
} from "@/lib/api/writing-exam";
import type { WritingExamDetail, WritingExamQuestion } from "@/lib/api/writing-exam";

const WORD_RANGES: Record<number, [number, number]> = {
  1: [60, 120],
  2: [120, 150],
  3: [120, 180],
};

const ACCENT_CHARS = "é è ê ë à â ù û ç î ï ô œ « »".split(" ");

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function WritingExamSessionPage() {
  const t = useTranslations("writingMockExam");
  const router = useRouter();
  const params = useParams<{ examId: string }>()!;
  const [exam, setExam] = useState<WritingExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTask, setCurrentTask] = useState(1);
  const [essays, setEssays] = useState<Record<string, string>>({ "1": "", "2": "", "3": "" });
  const [timeLeft, setTimeLeft] = useState(3600);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load exam data
  useEffect(() => {
    getWritingExam(params.examId)
      .then((data) => {
        if (data.status === "completed") {
          router.replace(`/writing-mock-exam/results/${params.examId}`);
          return;
        }
        setExam(data);
        // Restore saved essays
        const restored: Record<string, string> = { "1": "", "2": "", "3": "" };
        if (data.essays) {
          for (const [k, v] of Object.entries(data.essays)) {
            if (v && typeof v === "object" && "text" in v) {
              restored[k] = (v as { text: string }).text || "";
            }
          }
        }
        setEssays(restored);
        setTimeLeft(data.time_limit_seconds);
      })
      .catch(() => setExam(null))
      .finally(() => setLoading(false));
  }, [params.examId, router]);

  // Timer
  useEffect(() => {
    if (!exam || exam.status !== "in_progress") return;
    const started = new Date(exam.created_at).getTime();
    const elapsed = Math.floor((Date.now() - started) / 1000);
    const remaining = Math.max(0, exam.time_limit_seconds - elapsed);
    setTimeLeft(remaining);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  // Auto-save
  const doSave = useCallback(async () => {
    if (!exam || !dirty) return;
    const essayData: Record<string, { text: string; word_count: number }> = {};
    for (const [k, text] of Object.entries(essays)) {
      essayData[k] = { text, word_count: text.split(/\s+/).filter(Boolean).length };
    }
    try {
      await saveWritingExamEssays(params.examId, essayData);
      setDirty(false);
    } catch {
      // silent fail for auto-save
    }
  }, [exam, essays, dirty, params.examId]);

  useEffect(() => {
    saveTimerRef.current = setInterval(doSave, 30000);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [doSave]);

  const handleEssayChange = (text: string) => {
    setEssays((prev) => ({ ...prev, [String(currentTask)]: text }));
    setDirty(true);
  };

  const insertAccent = (char: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = essays[String(currentTask)] || "";
    const newText = current.slice(0, start) + char + current.slice(end);
    handleEssayChange(newText);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + char.length;
      ta.focus();
    }, 0);
  };

  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    setSubmitting(true);
    await doSave();
    try {
      await completeWritingExam(params.examId);
      router.replace(`/writing-mock-exam/results/${params.examId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!exam) return <div className="py-16 text-center text-muted-foreground">{t("notFound")}</div>;

  const questions: Record<number, WritingExamQuestion | null> = {
    1: exam.t1_question,
    2: exam.t2_question,
    3: exam.t3_question,
  };
  const currentQuestion = questions[currentTask];
  const currentText = essays[String(currentTask)] || "";
  const wordCount = currentText.split(/\s+/).filter(Boolean).length;
  const [minWords, maxWords] = WORD_RANGES[currentTask] || [60, 120];
  const wordColor = wordCount < minWords ? "text-amber-500" : wordCount > maxWords ? "text-red-500" : "text-emerald-500";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((num) => {
            const wc = (essays[String(num)] || "").split(/\s+/).filter(Boolean).length;
            return (
              <button
                key={num}
                onClick={() => setCurrentTask(num)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentTask === num
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                T{num}
                {wc > 0 && (
                  <Badge variant="secondary" className="text-xs">{wc}</Badge>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 font-mono text-sm ${timeLeft < 300 ? "text-red-500 animate-pulse" : ""}`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
          <Button size="sm" variant="outline" onClick={doSave} disabled={!dirty}>
            <Save className="mr-1 h-3 w-3" />
            {t("save")}
          </Button>
          <Button size="sm" onClick={() => setShowSubmitDialog(true)} disabled={submitting}>
            <Send className="mr-1 h-3 w-3" />
            {submitting ? t("grading") : t("submit")}
          </Button>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Consigne */}
        <div className="w-1/2 overflow-y-auto border-r p-4">
          <div className="space-y-4">
            <div>
              <Badge variant="outline">Tâche {currentTask}</Badge>
              {currentQuestion?.topic && (
                <Badge variant="secondary" className="ml-2">{currentQuestion.topic}</Badge>
              )}
            </div>
            {currentQuestion?.question_text && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="mb-2 text-sm font-semibold">{t("consigne")}</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {currentQuestion.question_text}
                  </div>
                </CardContent>
              </Card>
            )}
            {currentQuestion?.passage && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="mb-2 text-sm font-semibold">{t("refDocs")}</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {currentQuestion.passage}
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="text-xs text-muted-foreground">
              {t("wordRange")}: {minWords}-{maxWords} {t("words")}
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex w-1/2 flex-col">
          {/* Accent toolbar */}
          <div className="flex flex-wrap gap-1 border-b px-3 py-1.5">
            {ACCENT_CHARS.map((c) => (
              <button
                key={c}
                onClick={() => insertAccent(c)}
                className="rounded px-2 py-0.5 text-sm hover:bg-muted"
              >
                {c}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={currentText}
            onChange={(e) => handleEssayChange(e.target.value)}
            placeholder={t("editorPlaceholder")}
            className="flex-1 resize-none p-4 text-sm leading-relaxed outline-none"
            spellCheck
            lang="fr"
          />
          <div className="flex items-center justify-between border-t px-4 py-1.5 text-xs">
            <span className={wordColor}>
              {wordCount} {t("words")} ({minWords}-{maxWords})
            </span>
            {dirty && <span className="text-muted-foreground">{t("unsaved")}</span>}
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("submitConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                {[1, 2, 3].map((num) => {
                  const wc = (essays[String(num)] || "").split(/\s+/).filter(Boolean).length;
                  const [min, max] = WORD_RANGES[num] || [60, 120];
                  const warn = wc === 0 || wc < min || wc > max;
                  return (
                    <div key={num} className={`flex items-center justify-between ${warn ? "text-amber-500" : ""}`}>
                      <span>Tâche {num}</span>
                      <span className="flex items-center gap-1">
                        {warn && <AlertTriangle className="h-3 w-3" />}
                        {wc} {t("words")} ({min}-{max})
                      </span>
                    </div>
                  );
                })}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>{t("confirmSubmit")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

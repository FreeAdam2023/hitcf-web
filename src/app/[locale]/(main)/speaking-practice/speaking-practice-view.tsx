"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mic, RotateCcw, CheckCircle2, ExternalLink, Timer, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { FrenchText } from "@/components/practice/french-text";
import { SpeakingRecorder } from "@/components/speaking/speaking-recorder";
import { PronunciationScoreCard } from "@/components/speaking/pronunciation-score-card";
import { WordScoreList } from "@/components/speaking/word-score-list";
import { ConsigneTranslationToggle } from "@/components/writing/consigne-translation";
import { getTestSet, getTestSetQuestions } from "@/lib/api/test-sets";
import {
  createSpeakingAttempt,
  saveSpeakingResult,
  completeSpeakingAttempt,
} from "@/lib/api/speaking-attempts";
import { useSpeechAssessment } from "@/hooks/use-speech-assessment";
import type { TestSetDetail, QuestionBrief, SpeakingAttemptResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type ExamPhase = "idle" | "prep" | "recording" | "done";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ExamTimer({
  phase,
  prepTimeLeft,
  speakingTimeLeft,
  totalSpeakingTime,
  onStartEarly,
}: {
  phase: ExamPhase;
  prepTimeLeft: number;
  speakingTimeLeft: number;
  totalSpeakingTime: number;
  onStartEarly: () => void;
}) {
  const t = useTranslations("speakingPractice");

  if (phase === "idle" || phase === "done") return null;

  const isPrep = phase === "prep";
  const timeLeft = isPrep ? prepTimeLeft : speakingTimeLeft;
  const ratio = isPrep ? 1 : totalSpeakingTime > 0 ? speakingTimeLeft / totalSpeakingTime : 1;

  return (
    <div className="rounded-lg border bg-card p-4 text-center space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        {isPrep ? t("prepPhase") : t("recordingPhase")}
      </p>
      <div
        className={cn(
          "text-4xl font-bold tabular-nums",
          isPrep
            ? "text-blue-600 dark:text-blue-400"
            : ratio > 0.5
              ? "text-green-600 dark:text-green-400"
              : ratio > 0.2
                ? "text-amber-600 dark:text-amber-400"
                : "text-red-600 dark:text-red-400",
        )}
      >
        {formatCountdown(timeLeft)}
      </div>
      {isPrep && (
        <Button variant="outline" size="sm" onClick={onStartEarly}>
          <Play className="mr-1.5 h-3.5 w-3.5" />
          {t("startRecordingEarly")}
        </Button>
      )}
      {!isPrep && (
        <p className="text-xs text-muted-foreground">
          {t("autoStopNotice")}
        </p>
      )}
    </div>
  );
}

export default function SpeakingPracticeView() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const testSetId = searchParams.get("testSetId");
  const questionId = searchParams.get("questionId");
  const mode = (searchParams.get("mode") === "exam" ? "exam" : "practice") as "practice" | "exam";

  const [loading, setLoading] = useState(true);
  const [testSet, setTestSet] = useState<TestSetDetail | null>(null);
  const [question, setQuestion] = useState<QuestionBrief | null>(null);

  // Attempt state
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Exam mode state
  const [examPhase, setExamPhase] = useState<ExamPhase>("idle");
  const [prepTimeLeft, setPrepTimeLeft] = useState(0);
  const [speakingTimeLeft, setSpeakingTimeLeft] = useState(0);
  const [totalSpeakingTime, setTotalSpeakingTime] = useState(0);
  const examTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptDataRef = useRef<SpeakingAttemptResponse | null>(null);

  const {
    isRecording,
    transcript,
    interimTranscript,
    scores,
    wordScores,
    error,
    duration,
    startRecording,
    stopRecording,
    reset,
  } = useSpeechAssessment();

  // Load test set + question + create attempt
  useEffect(() => {
    if (!testSetId || !questionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const [ts, questions] = await Promise.all([
          getTestSet(testSetId!),
          getTestSetQuestions(testSetId!, "practice"),
        ]);
        if (cancelled) return;
        setTestSet(ts);
        const q = questions.find((q) => q.id === questionId) ?? null;
        setQuestion(q);

        // Create attempt
        try {
          const attempt = await createSpeakingAttempt({
            test_set_id: testSetId!,
            question_id: questionId!,
            mode,
          });
          if (cancelled) return;
          setAttemptId(attempt.id);
          attemptDataRef.current = attempt;

          // For exam mode, set up timers from attempt data
          if (mode === "exam") {
            setPrepTimeLeft(attempt.prep_time_seconds);
            setSpeakingTimeLeft(attempt.speaking_time_seconds);
            setTotalSpeakingTime(attempt.speaking_time_seconds);
          }
        } catch (err) {
          console.error("Failed to create speaking attempt", err);
        }
      } catch (err) {
        console.error("Failed to load speaking topic", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [testSetId, questionId, mode]);

  // Auto-save when scores arrive
  useEffect(() => {
    if (!scores || !attemptId || saveStatus !== "idle") return;

    let cancelled = false;
    async function save() {
      setSaveStatus("saving");
      try {
        await saveSpeakingResult(attemptId!, {
          transcript,
          duration_seconds: duration,
          scores: scores ? { accuracy: scores.accuracy, fluency: scores.fluency, completeness: scores.completeness, prosody: scores.prosody, overall: scores.overall } : null,
          word_scores: wordScores.map((w) => ({
            word: w.word,
            accuracy: w.accuracy,
            errorType: w.errorType,
          })),
        });
        if (cancelled) return;
        await completeSpeakingAttempt(attemptId!);
        if (!cancelled) setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to save speaking result", err);
        if (!cancelled) setSaveStatus("idle");
      }
    }
    save();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores, attemptId]);

  // Exam timer countdown
  useEffect(() => {
    if (examPhase !== "prep" && examPhase !== "recording") return;

    examTimerRef.current = setInterval(() => {
      if (examPhase === "prep") {
        setPrepTimeLeft((prev) => {
          if (prev <= 1) {
            // Prep done, start recording phase
            startRecordingPhase();
            return 0;
          }
          return prev - 1;
        });
      } else if (examPhase === "recording") {
        setSpeakingTimeLeft((prev) => {
          if (prev <= 1) {
            // Time up, stop recording
            stopRecording();
            setExamPhase("done");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examPhase]);

  const startRecordingPhase = useCallback(() => {
    if (examTimerRef.current) clearInterval(examTimerRef.current);
    setExamPhase("recording");
    startRecording();
  }, [startRecording]);

  const handleStartExam = useCallback(() => {
    setExamPhase("prep");
  }, []);

  const handleStartEarly = useCallback(() => {
    setPrepTimeLeft(0);
    startRecordingPhase();
  }, [startRecordingPhase]);

  const handleTryAgain = useCallback(async () => {
    reset();
    setSaveStatus("idle");
    setExamPhase("idle");
    // Create a new attempt (force_new)
    if (testSetId && questionId) {
      try {
        const attempt = await createSpeakingAttempt(
          { test_set_id: testSetId, question_id: questionId, mode },
          { forceNew: true },
        );
        setAttemptId(attempt.id);
        attemptDataRef.current = attempt;
        if (mode === "exam") {
          setPrepTimeLeft(attempt.prep_time_seconds);
          setSpeakingTimeLeft(attempt.speaking_time_seconds);
          setTotalSpeakingTime(attempt.speaking_time_seconds);
        }
      } catch (err) {
        console.error("Failed to create new speaking attempt", err);
      }
    }
  }, [reset, testSetId, questionId, mode]);

  // Practice mode: handle stop recording (no special handling needed,
  // auto-save via scores effect handles it)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (!testSetId || !questionId || !question) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t("speakingPractice.noTopicSelected")}
      </div>
    );
  }

  const isTache2 = testSet?.code?.includes("tache2") ?? false;
  const isExam = mode === "exam";
  const showRecorder = !isExam || examPhase === "recording" || examPhase === "done";

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Breadcrumb
        items={[
          { label: t("testDetail.breadcrumbTests"), href: "/tests?tab=speaking" },
          { label: testSet?.name ?? t("speakingPractice.title") },
          { label: isExam ? t("speakingPractice.examMode") : t("speakingPractice.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {isExam ? t("speakingPractice.examMode") : t("speakingPractice.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isTache2 ? t("tests.speakingTache2") : t("tests.speakingTache3")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isExam ? "default" : "secondary"}>
            {isExam ? t("speakingPractice.examMode") : t("speakingPractice.practiceMode")}
          </Badge>
          <Badge variant="secondary">
            {isTache2 ? "Tâche 2" : "Tâche 3"}
          </Badge>
        </div>
      </div>

      {/* Split view */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: Consigne */}
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Consigne
          </h3>
          <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-line">
            <FrenchText text={question.question_text ?? ""} />
          </div>
          {question.passage && (
            <div className="mt-3 rounded-md bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {t("writingExam.referenceDocuments")}
              </p>
              <div className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                <FrenchText text={question.passage} />
              </div>
            </div>
          )}
          <ConsigneTranslationToggle key={question.id} questionId={question.id} />
        </div>

        {/* Right: Timer / Recording + Transcript + Scores */}
        <div className="flex flex-col gap-4">
          {/* Exam: Start button when idle */}
          {isExam && examPhase === "idle" && !scores && (
            <div className="rounded-lg border bg-card p-6 text-center space-y-4">
              <Timer className="mx-auto h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("speakingPractice.examModeDesc")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("speakingPractice.prepPhase")}: {formatCountdown(attemptDataRef.current?.prep_time_seconds ?? 120)}
                  {" · "}
                  {t("speakingPractice.recordingPhase")}: {formatCountdown(attemptDataRef.current?.speaking_time_seconds ?? 210)}
                </p>
              </div>
              <Button onClick={handleStartExam} size="lg">
                <Play className="mr-1.5 h-4 w-4" />
                {t("common.actions.start")}
              </Button>
            </div>
          )}

          {/* Exam: Timer during prep/recording */}
          {isExam && (examPhase === "prep" || examPhase === "recording") && (
            <ExamTimer
              phase={examPhase}
              prepTimeLeft={prepTimeLeft}
              speakingTimeLeft={speakingTimeLeft}
              totalSpeakingTime={totalSpeakingTime}
              onStartEarly={handleStartEarly}
            />
          )}

          {/* Recorder (always show in practice mode, show in exam during recording/done) */}
          {showRecorder && (
            <SpeakingRecorder
              isRecording={isRecording}
              duration={duration}
              transcript={transcript}
              interimTranscript={interimTranscript}
              onStart={isExam ? undefined : startRecording}
              onStop={isExam && examPhase === "recording" ? undefined : stopRecording}
              error={error}
            />
          )}

          {/* Action buttons */}
          {!isRecording && (transcript || scores) && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Save status */}
              {saveStatus === "saving" && (
                <span className="text-xs text-muted-foreground">
                  {t("speakingPractice.saving")}
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("speakingPractice.saved")}
                </span>
              )}

              {/* Try again (practice mode only) */}
              {!isExam && (
                <Button variant="outline" size="sm" onClick={handleTryAgain} className="self-start">
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  {t("speakingPractice.tryAgain")}
                </Button>
              )}

              {/* View results link */}
              {saveStatus === "saved" && attemptId && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/speaking-practice/results/${attemptId}`}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    {t("speakingPractice.viewResults")}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results section (below split view) */}
      {scores && (
        <>
          <Separator />
          <div className="grid gap-4 lg:grid-cols-2">
            <PronunciationScoreCard scores={scores} />
            <div className="rounded-lg border bg-card p-4">
              <WordScoreList words={wordScores} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

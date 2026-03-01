"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mic, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { FrenchText } from "@/components/practice/french-text";
import { SpeakingRecorder } from "@/components/speaking/speaking-recorder";
import { PronunciationScoreCard } from "@/components/speaking/pronunciation-score-card";
import { WordScoreList } from "@/components/speaking/word-score-list";
import { ConsigneTranslationToggle } from "@/components/writing/consigne-translation";
import { getTestSet, getTestSetQuestions } from "@/lib/api/test-sets";
import { useSpeechAssessment } from "@/hooks/use-speech-assessment";
import type { TestSetDetail, QuestionBrief } from "@/lib/api/types";

export default function SpeakingPracticePage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const testSetId = searchParams.get("testSetId");
  const questionId = searchParams.get("questionId");

  const [loading, setLoading] = useState(true);
  const [testSet, setTestSet] = useState<TestSetDetail | null>(null);
  const [question, setQuestion] = useState<QuestionBrief | null>(null);

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

  // Load test set + question
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
      } catch (err) {
        console.error("Failed to load speaking topic", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [testSetId, questionId]);

  if (loading) return <LoadingSpinner />;

  if (!testSetId || !questionId || !question) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t("speakingPractice.noTopicSelected")}
      </div>
    );
  }

  const isTache2 = testSet?.code?.includes("tache2") ?? false;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Breadcrumb
        items={[
          { label: t("testDetail.breadcrumbTests"), href: "/tests?tab=speaking" },
          { label: testSet?.name ?? t("speakingPractice.title") },
          { label: t("speakingPractice.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t("speakingPractice.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {isTache2 ? t("tests.speakingTache2") : t("tests.speakingTache3")}
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          {isTache2 ? "Tâche 2" : "Tâche 3"}
        </Badge>
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

        {/* Right: Recording + Transcript + Scores */}
        <div className="flex flex-col gap-4">
          <SpeakingRecorder
            isRecording={isRecording}
            duration={duration}
            transcript={transcript}
            interimTranscript={interimTranscript}
            onStart={startRecording}
            onStop={stopRecording}
            error={error}
          />

          {/* Reset button (when we have results) */}
          {!isRecording && (transcript || scores) && (
            <Button variant="outline" size="sm" onClick={reset} className="self-start">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {t("speakingPractice.tryAgain")}
            </Button>
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

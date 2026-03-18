"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
  Volume2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpeakingRecorder } from "@/components/speaking/speaking-recorder";
import { PronunciationScoreCard } from "@/components/speaking/pronunciation-score-card";
import { useSpeechAssessment } from "@/hooks/use-speech-assessment";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import {
  type SpeakingScriptResponse,
  type ScriptTopic,
} from "@/lib/api/speaking-scripts";
import { post } from "@/lib/api/client";

type PracticeMode = "read_along" | "memory";
type PracticePhase = "mode_select" | "active" | "result" | "summary";

interface ExchangeScore {
  exchangeIndex: number;
  referenceText: string;
  transcript: string;
  durationSeconds: number;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    overall: number;
  } | null;
  textSimilarity: number | null;
}

function computeTextSimilarity(reference: string, spoken: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-zà-ÿ0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const refWords = normalize(reference);
  const spokenWords = normalize(spoken);
  if (refWords.length === 0) return 0;
  const spokenSet = new Set(spokenWords);
  let matched = 0;
  for (const w of refWords) {
    if (spokenSet.has(w)) matched++;
  }
  return matched / refWords.length;
}

interface ScriptPracticeProps {
  script: SpeakingScriptResponse;
  onBack: () => void;
}

export function ScriptPractice({ script, onBack }: ScriptPracticeProps) {
  const t = useTranslations("speakingScripts");

  const [phase, setPhase] = useState<PracticePhase>("mode_select");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("read_along");
  const [themeKey, setThemeKey] = useState<string>(
    script.topics[0]?.theme ?? "identite",
  );
  const [exchangeIdx, setExchangeIdx] = useState(0);
  const [exchangeScores, setExchangeScores] = useState<ExchangeScore[]>([]);

  const topic: ScriptTopic | undefined = useMemo(
    () => script.topics.find((tp) => tp.theme === themeKey),
    [script.topics, themeKey],
  );
  const exchange = topic?.exchanges[exchangeIdx];
  const totalExchanges = topic?.exchanges.length ?? 0;
  const isLastExchange = exchangeIdx >= totalExchanges - 1;

  // Speech assessment: use referenceText in read_along mode
  const refText = practiceMode === "read_along" ? exchange?.candidate_fr : undefined;
  const assessment = useSpeechAssessment(refText);

  // TTS for examiner questions
  const tts = useSpeechSynthesis("fr-CA-SylvieNeural");

  const handlePlayExaminer = useCallback(() => {
    if (!exchange) return;
    if (tts.isSpeaking) {
      tts.stop();
      return;
    }
    tts.speak(exchange.examiner_fr);
  }, [exchange, tts]);

  // Start practice session
  const handleStartPractice = useCallback(() => {
    setExchangeIdx(0);
    setExchangeScores([]);
    setPhase("active");
  }, []);

  // Record current exchange score and advance
  const handleNext = useCallback(() => {
    if (!exchange) return;

    const similarity =
      practiceMode === "memory" && assessment.transcript
        ? computeTextSimilarity(exchange.candidate_fr, assessment.transcript)
        : null;

    const score: ExchangeScore = {
      exchangeIndex: exchangeIdx,
      referenceText: exchange.candidate_fr,
      transcript: assessment.transcript,
      durationSeconds: assessment.duration,
      scores: assessment.scores,
      textSimilarity: similarity,
    };

    const newScores = [...exchangeScores, score];
    setExchangeScores(newScores);

    if (isLastExchange) {
      // Save results to backend
      const aggScores = computeAggregateScores(newScores);
      const totalDuration = newScores.reduce((s, e) => s + e.durationSeconds, 0);

      post(`/api/speaking-scripts/${script.id}/practice`, {
        theme: themeKey,
        mode: practiceMode,
        exchange_results: newScores.map((es) => ({
          exchange_index: es.exchangeIndex,
          reference_text: es.referenceText,
          transcript: es.transcript,
          duration_seconds: es.durationSeconds,
          scores: es.scores,
          word_scores: [],
          text_similarity: es.textSimilarity,
        })),
        aggregate_scores: aggScores,
        total_duration_seconds: totalDuration,
      }).catch(() => {
        // Non-blocking save failure
      });

      setPhase("summary");
    } else {
      setExchangeIdx((prev) => prev + 1);
      assessment.reset();
      setPhase("active");
    }
  }, [
    exchange, exchangeIdx, exchangeScores, isLastExchange,
    assessment, practiceMode, script.id, themeKey,
  ]);

  // Retry current exchange
  const handleRetry = useCallback(() => {
    assessment.reset();
  }, [assessment]);

  // Auto-play examiner question in memory mode when exchange changes
  useEffect(() => {
    if (phase === "active" && practiceMode === "memory" && exchange) {
      const timer = setTimeout(() => {
        tts.speak(exchange.examiner_fr);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, exchangeIdx, practiceMode]);

  // ── Mode Select ──────────────────────────────────────────────
  if (phase === "mode_select") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{t("practice.title")}</h2>
        </div>

        {/* Theme selection */}
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            {t("practice.selectTheme")}
          </p>
          <div className="flex flex-wrap gap-2">
            {script.topics.map((tp) => (
              <button
                key={tp.theme}
                onClick={() => setThemeKey(tp.theme)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  themeKey === tp.theme
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {t(`themes.${tp.theme}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Mode selection */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setPracticeMode("read_along")}
            className={`rounded-lg border p-4 text-left transition-all ${
              practiceMode === "read_along"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{t("practice.readAlong")}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("practice.readAlongDesc")}
            </p>
          </button>
          <button
            onClick={() => setPracticeMode("memory")}
            className={`rounded-lg border p-4 text-left transition-all ${
              practiceMode === "memory"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <EyeOff className="h-4 w-4" />
              <span className="font-medium">{t("practice.memory")}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("practice.memoryDesc")}
            </p>
          </button>
        </div>

        <Button onClick={handleStartPractice} className="w-full sm:w-auto">
          {t("practice.begin")}
        </Button>
      </div>
    );
  }

  // ── Active Practice ──────────────────────────────────────────
  if (phase === "active" && exchange) {
    const hasResult = !!assessment.scores || (assessment.transcript && !assessment.isRecording);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-sm font-semibold">
                {t(`themes.${themeKey}`)}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("practice.exchange", {
                  current: exchangeIdx + 1,
                  total: totalExchanges,
                })}
              </p>
            </div>
          </div>
          <Badge variant={practiceMode === "read_along" ? "secondary" : "outline"}>
            {practiceMode === "read_along"
              ? t("practice.readAlong")
              : t("practice.memory")}
          </Badge>
        </div>

        {/* Progress */}
        <div className="h-1 rounded-full bg-muted">
          <div
            className="h-1 rounded-full bg-primary transition-all"
            style={{
              width: `${((exchangeIdx + (hasResult ? 1 : 0)) / totalExchanges) * 100}%`,
            }}
          />
        </div>

        {/* Examiner question */}
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {t("examiner")}
                </p>
                <p className="text-sm">{exchange.examiner_fr}</p>
                {(exchange.examiner_zh || exchange.examiner_en) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {exchange.examiner_zh}
                    {exchange.examiner_zh && exchange.examiner_en && " / "}
                    {exchange.examiner_en}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={handlePlayExaminer}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reference text (read-along mode only) */}
        {practiceMode === "read_along" && (
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                {t("candidate")}
              </p>
              <p className="text-sm">{exchange.candidate_fr}</p>
              {(exchange.zh || exchange.en) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {exchange.zh}
                  {exchange.zh && exchange.en && " / "}
                  {exchange.en}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recorder */}
        <SpeakingRecorder
          isRecording={assessment.isRecording}
          duration={assessment.duration}
          transcript={assessment.transcript}
          interimTranscript={assessment.interimTranscript}
          onStart={assessment.startRecording}
          onStop={assessment.stopRecording}
          error={assessment.error}
        />

        {/* Scores */}
        {assessment.scores && (
          <PronunciationScoreCard scores={assessment.scores} />
        )}

        {/* Memory mode: show reference after recording */}
        {practiceMode === "memory" && hasResult && !assessment.isRecording && (
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {t("practice.referenceAnswer")}
              </p>
              <p className="text-sm">{exchange.candidate_fr}</p>
              {assessment.transcript && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t("practice.textMatch")}:
                  </span>
                  <Badge variant="outline">
                    {Math.round(
                      computeTextSimilarity(
                        exchange.candidate_fr,
                        assessment.transcript,
                      ) * 100,
                    )}
                    %
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        {hasResult && !assessment.isRecording && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {t("practice.retry")}
            </Button>
            <Button size="sm" onClick={handleNext}>
              {isLastExchange ? t("practice.finish") : t("practice.next")}
              {!isLastExchange && <ChevronRight className="ml-1 h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── Summary ──────────────────────────────────────────────────
  if (phase === "summary") {
    const agg = computeAggregateScores(exchangeScores);
    const totalDuration = exchangeScores.reduce((s, e) => s + e.durationSeconds, 0);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{t("practice.sessionComplete")}</h2>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{t(`themes.${themeKey}`)}</Badge>
          <span>
            {practiceMode === "read_along"
              ? t("practice.readAlong")
              : t("practice.memory")}
          </span>
          <span>
            {exchangeScores.length} {t("practice.exchanges")}
          </span>
          <span>
            {Math.floor(totalDuration / 60)}:{(totalDuration % 60)
              .toString()
              .padStart(2, "0")}
          </span>
        </div>

        {agg && <PronunciationScoreCard scores={agg} />}

        {/* Per-exchange breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("practice.breakdown")}</p>
          {exchangeScores.map((es, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">
                Q{idx + 1}: {es.referenceText.slice(0, 40)}
                {es.referenceText.length > 40 ? "..." : ""}
              </span>
              <div className="flex items-center gap-2">
                {es.scores && (
                  <Badge variant="outline">{es.scores.overall}</Badge>
                )}
                {es.textSimilarity !== null && (
                  <Badge variant="outline">
                    {Math.round(es.textSimilarity * 100)}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => {
            setExchangeIdx(0);
            setExchangeScores([]);
            assessment.reset();
            setPhase("mode_select");
          }}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("practice.practiceAgain")}
          </Button>
          <Button size="sm" onClick={onBack}>
            {t("practice.backToScript")}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

function computeAggregateScores(
  scores: ExchangeScore[],
): { accuracy: number; fluency: number; completeness: number; prosody: number; overall: number } | null {
  const withScores = scores.filter((s) => s.scores);
  if (withScores.length === 0) return null;

  const avg = (key: keyof NonNullable<ExchangeScore["scores"]>) =>
    Math.round(
      withScores.reduce((sum, s) => sum + (s.scores![key] ?? 0), 0) / withScores.length,
    );

  return {
    accuracy: avg("accuracy"),
    fluency: avg("fluency"),
    completeness: avg("completeness"),
    prosody: avg("prosody"),
    overall: avg("overall"),
  };
}

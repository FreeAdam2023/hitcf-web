"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedTopic } from "@/lib/test-name";
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { SceneBriefingCard } from "@/components/speaking/scene-briefing-card";
import { ConversationChat } from "@/components/speaking/conversation-chat";
import { useSpeechAssessment, type WordScore } from "@/hooks/use-speech-assessment";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import {
  beginConversation,
  sendTurn,
  endConversation,
} from "@/lib/api/speaking-conversation";
import { getSpeakingExam, finishSpeakingExam } from "@/lib/api/speaking-exam";
import type { ConversationTurnResponse } from "@/lib/api/types";
import type { SpeakingExamDetail } from "@/lib/api/speaking-exam";

type ExamPhase =
  | "loading"
  | "t1_intro"
  | "t1_active"
  | "t1_evaluating"
  | "t2_intro"
  | "t2_prep"
  | "t2_active"
  | "t2_evaluating"
  | "t3_intro"
  | "t3_active"
  | "t3_evaluating"
  | "finishing"
  | "completed";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSceneSsml(scenario: string, tacheType: number): string {
  const intro = tacheType === 3
    ? "Voici le sujet de discussion."
    : "Écoutez bien le scénario.";
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-CA">
  <voice name="fr-CA-SylvieNeural">
    <break time="500ms"/>
    <prosody rate="0.93" pitch="-2%">
      ${escapeXml(intro)}
      <break time="700ms"/>
      ${escapeXml(scenario)}
    </prosody>
  </voice>
</speak>`;
}

// Timer durations (seconds)
const T1_SPEAKING = 150; // 2min 30s
const T2_PREP = 120;     // 2min
const T2_SPEAKING = 210; // 3min 30s
const T3_SPEAKING = 270; // 4min 30s

export default function SpeakingExamSessionPage() {
  const t = useTranslations("speakingExam");
  const tc = useTranslations("speakingConversation");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ examId: string }>()!;

  // Core state
  const [phase, setPhase] = useState<ExamPhase>("loading");
  const [exam, setExam] = useState<SpeakingExamDetail | null>(null);
  const [turns, setTurns] = useState<ConversationTurnResponse[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [timer, setTimer] = useState(0);

  // Refs
  const activeSessionId = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sceneTtsTriggered = useRef(false);
  const phaseRef = useRef<ExamPhase>("loading");
  phaseRef.current = phase;

  // Hooks
  const speech = useSpeechAssessment();
  const tts = useSpeechSynthesis();

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Load exam data
  useEffect(() => {
    getSpeakingExam(params.examId)
      .then((data) => {
        setExam(data);
        if (data.status === "completed") {
          router.replace(`/speaking-exam/results/${data.id}`);
          return;
        }
        // Determine which phase to enter
        if (!data.tache1 || data.tache1.status !== "completed") {
          setPhase("t1_intro");
        } else if (!data.tache2 || data.tache2.status !== "completed") {
          setPhase("t2_intro");
        } else if (!data.tache3 || data.tache3.status !== "completed") {
          setPhase("t3_intro");
        } else {
          // All done — finish
          handleFinish(data.id);
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load exam");
        router.push("/speaking-exam");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown
  useEffect(() => {
    const tickPhases: ExamPhase[] = ["t1_active", "t2_prep", "t2_active", "t3_active"];
    if (!tickPhases.includes(phase)) return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimerExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto TTS during T2 prep
  useEffect(() => {
    if (phase !== "t2_prep") return;
    if (!exam?.t2_question?.question_text) return;
    if (sceneTtsTriggered.current) return;

    sceneTtsTriggered.current = true;
    const ssml = buildSceneSsml(exam.t2_question.question_text, 2);
    tts.speak(ssml, { ssml: true }).catch(() => {});

    return () => { tts.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Handle timer expiry based on current phase
  const handleTimerExpired = useCallback(() => {
    const p = phaseRef.current;
    if (p === "t1_active") handleEndTache();
    else if (p === "t2_prep") handleBeginTache();
    else if (p === "t2_active") handleEndTache();
    else if (p === "t3_active") handleEndTache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current session ID for the active tâche
  const getCurrentSessionId = useCallback(() => {
    if (!exam) return "";
    if (phase.startsWith("t1")) return exam.tache1_session_id || "";
    if (phase.startsWith("t2")) return exam.tache2_session_id || "";
    if (phase.startsWith("t3")) return exam.tache3_session_id || "";
    return "";
  }, [exam, phase]);

  // Start active conversation (called from intro/prep)
  const handleBeginTache = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    tts.stop();

    const sessionId = getCurrentSessionId();
    activeSessionId.current = sessionId;

    try {
      const result = await beginConversation(sessionId);
      const examinerTurn: ConversationTurnResponse = {
        role: "examiner",
        text: result.examiner_text,
        timestamp: new Date().toISOString(),
        pronunciation_scores: null,
        word_scores: [],
      };
      setTurns([examinerTurn]);

      if (phase === "t1_intro") {
        setTimer(T1_SPEAKING);
        setPhase("t1_active");
      } else if (phase === "t2_intro" || phase === "t2_prep") {
        setTimer(T2_SPEAKING);
        setPhase("t2_active");
      } else if (phase === "t3_intro") {
        setTimer(T3_SPEAKING);
        setPhase("t3_active");
      }

      tts.speak(result.examiner_text);
    } catch (err) {
      const message = err instanceof Error ? err.message : tc("beginFailed");
      toast.error(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, exam]);

  // Toggle recording
  const handleToggleRecord = useCallback(async () => {
    if (speech.isRecording) {
      speech.stopRecording();
      const transcript = speech.transcript;
      if (!transcript.trim()) return;

      setIsWaiting(true);
      try {
        const result = await sendTurn(activeSessionId.current, {
          user_text: transcript,
          pronunciation_scores: speech.scores
            ? {
                accuracy: speech.scores.accuracy,
                fluency: speech.scores.fluency,
                completeness: speech.scores.completeness,
                prosody: speech.scores.prosody,
                overall: speech.scores.overall,
              }
            : null,
          word_scores: speech.wordScores.map((w: WordScore) => ({
            word: w.word,
            accuracy: w.accuracy,
            errorType: w.errorType,
          })),
        });

        const userTurn: ConversationTurnResponse = {
          role: "user",
          text: transcript,
          timestamp: new Date().toISOString(),
          pronunciation_scores: speech.scores ? { ...speech.scores } : null,
          word_scores: speech.wordScores.map((w: WordScore) => ({
            word: w.word,
            accuracy: w.accuracy,
            errorType: w.errorType,
          })),
        };
        const examinerTurn: ConversationTurnResponse = {
          role: "examiner",
          text: result.examiner_text,
          timestamp: new Date().toISOString(),
          pronunciation_scores: null,
          word_scores: [],
        };
        setTurns((prev) => [...prev, userTurn, examinerTurn]);
        tts.speak(result.examiner_text);
      } catch (err) {
        const message = err instanceof Error ? err.message : tc("turnFailed");
        toast.error(message);
      } finally {
        setIsWaiting(false);
        speech.reset();
      }
    } else {
      tts.stop();
      speech.reset();
      await speech.startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.isRecording, speech.transcript, speech.scores, speech.wordScores]);

  // End current tâche conversation
  const handleEndTache = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (speech.isRecording) speech.stopRecording();
    tts.stop();

    const currentPhase = phaseRef.current;

    if (currentPhase === "t1_active") setPhase("t1_evaluating");
    else if (currentPhase === "t2_active") setPhase("t2_evaluating");
    else if (currentPhase === "t3_active") setPhase("t3_evaluating");

    try {
      await endConversation(activeSessionId.current);

      // Move to next tâche
      if (currentPhase === "t1_active") {
        setTurns([]);
        sceneTtsTriggered.current = false;
        setPhase("t2_intro");
      } else if (currentPhase === "t2_active") {
        setTurns([]);
        setPhase("t3_intro");
      } else if (currentPhase === "t3_active") {
        handleFinish(params.examId);
      }
    } catch {
      toast.error(tc("endFailed"));
      // Still try to advance
      if (currentPhase === "t1_active") {
        setTurns([]);
        setPhase("t2_intro");
      } else if (currentPhase === "t2_active") {
        setTurns([]);
        setPhase("t3_intro");
      } else {
        handleFinish(params.examId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Finish exam (aggregate scores)
  const handleFinish = useCallback(async (examId: string) => {
    setPhase("finishing");
    try {
      await finishSpeakingExam(examId);
      router.push(`/speaking-exam/results/${examId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to finish exam";
      toast.error(message);
      router.push(`/speaking-exam/results/${examId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────

  if (phase === "loading" || phase === "finishing") {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">
          {phase === "finishing" ? t("finishing") : t("loading")}
        </p>
      </div>
    );
  }

  const currentTache = phase.startsWith("t1") ? 1 : phase.startsWith("t2") ? 2 : 3;
  const tacheLabel = `Tâche ${currentTache}`;
  const isIntro = phase.endsWith("_intro");
  const isPrep = phase === "t2_prep";
  const isActive = phase.endsWith("_active");
  const isEvaluating = phase.endsWith("_evaluating");

  const timerColor =
    isActive && timer <= 30
      ? "text-destructive"
      : isActive && timer <= 60
        ? "text-amber-600"
        : isPrep
          ? "text-blue-600"
          : "text-foreground";

  // Progress indicators
  const tacheSteps = [
    { n: 1, done: phase.startsWith("t2") || phase.startsWith("t3") || phase === "completed" },
    { n: 2, done: phase.startsWith("t3") || phase === "completed" },
    { n: 3, done: false },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-28 sm:px-0">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {tacheSteps.map((step) => (
          <div key={step.n} className="flex items-center gap-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step.n === currentTache
                  ? "bg-primary text-primary-foreground"
                  : step.done
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step.done ? <CheckCircle2 className="h-4 w-4" /> : step.n}
            </div>
            {step.n < 3 && (
              <div className={`h-0.5 w-8 sm:w-12 ${step.done ? "bg-emerald-400" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Mic className="h-5 w-5 shrink-0 text-primary" />
          <h1 className="truncate text-lg font-semibold">
            {t("title")} · {tacheLabel}
          </h1>
        </div>
        {(isActive || isPrep) && (
          <span className={`shrink-0 font-mono text-lg font-bold ${timerColor}`}>
            {formatTime(timer)}
          </span>
        )}
      </div>

      {/* Phase badge */}
      <Badge variant="outline" className="w-fit">
        {isIntro && t("introPhase")}
        {isPrep && tc("prepPhase")}
        {isActive && tc("activePhase")}
        {isEvaluating && tc("evaluating")}
      </Badge>

      {/* ── Intro screens ── */}
      {isIntro && (
        <Card>
          <CardHeader>
            <CardTitle>{tacheLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTache === 1 && (
              <>
                <p className="text-sm lg:text-base text-muted-foreground">{t("tache1Desc")}</p>
                <div className="rounded-lg bg-muted/50 p-3 text-sm lg:text-base">
                  <strong>{t("format")}:</strong> {t("tache1Format")}
                </div>
              </>
            )}
            {currentTache === 2 && exam?.t2_question && (
              <>
                <p className="text-sm lg:text-base text-muted-foreground">{t("tache2Desc")}</p>
                <SceneBriefingCard
                  briefing={{
                    scenario: exam.t2_question.question_text || "",
                    your_role: t("tache2YourRole"),
                    examiner_role: t("tache2ExaminerRole"),
                    target_duration: "3 min 30 s",
                    tache_type: 2,
                  }}
                />
                <div className="rounded-lg bg-blue-50 p-3 text-sm lg:text-base dark:bg-blue-950/30">
                  <strong>{t("prepNotice")}:</strong> {t("tache2PrepNotice")}
                </div>
              </>
            )}
            {currentTache === 3 && exam?.t3_question && (
              <>
                <p className="text-sm lg:text-base text-muted-foreground">{t("tache3Desc")}</p>
                <div className="rounded-lg border p-3">
                  <p className="text-sm lg:text-base font-medium">{t("topic")}:</p>
                  <p className="mt-1 text-sm lg:text-base">{exam.t3_question.question_text}</p>
                  {locale !== "fr" && getLocalizedTopic(locale, null, exam.t3_question.topic_zh, exam.t3_question.topic_en, exam.t3_question.topic_ar) && (
                    <p className="mt-1 text-xs lg:text-sm text-muted-foreground">
                      {getLocalizedTopic(locale, null, exam.t3_question.topic_zh, exam.t3_question.topic_en, exam.t3_question.topic_ar)}
                    </p>
                  )}
                </div>
              </>
            )}

            <Button
              className="w-full"
              onClick={() => {
                if (currentTache === 2) {
                  // Go to prep phase first
                  setTimer(T2_PREP);
                  setPhase("t2_prep");
                } else {
                  handleBeginTache();
                }
              }}
            >
              {currentTache === 2 ? t("startPrep") : t("startTache")}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── T2 Prep phase ── */}
      {isPrep && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            {exam?.t2_question && (
              <SceneBriefingCard
                briefing={{
                  scenario: exam.t2_question.question_text || "",
                  your_role: t("tache2YourRole"),
                  examiner_role: t("tache2ExaminerRole"),
                  target_duration: "3 min 30 s",
                  tache_type: 2,
                }}
              />
            )}
            {tts.isSpeaking ? (
              <div className="flex items-center gap-2 animate-in fade-in duration-700">
                <Volume2 className="h-4 w-4 animate-pulse text-primary" />
                <span className="text-sm font-medium text-primary">
                  {tc("examinerReading")}
                </span>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (exam?.t2_question?.question_text) {
                    const ssml = buildSceneSsml(exam.t2_question.question_text, 2);
                    tts.speak(ssml, { ssml: true });
                  }
                }}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                {tc("replayScenario")}
              </Button>
            )}
            <p className="text-center text-sm lg:text-base text-muted-foreground">
              {tc("prepDescription")}
            </p>
            <Button onClick={handleBeginTache}>{tc("startEarly")}</Button>
          </CardContent>
        </Card>
      )}

      {/* ── Active conversation ── */}
      {(isActive || isEvaluating) && (
        <>
          <Card className="flex min-h-[400px] flex-col">
            <ConversationChat turns={turns} isWaiting={isWaiting} />
          </Card>

          {/* Interim transcript */}
          {speech.isRecording && speech.transcript && (
            <div className="break-words rounded-md border border-blue-200 bg-blue-50/50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/20">
              <span className="text-muted-foreground">{tc("youAreSaying")}:</span>{" "}
              {speech.transcript}
              {speech.interimTranscript && (
                <span className="text-muted-foreground">{speech.interimTranscript}</span>
              )}
            </div>
          )}

          {/* Controls */}
          {isActive && (
            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="mx-auto flex max-w-2xl items-center justify-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  variant={speech.isRecording ? "destructive" : "default"}
                  className="h-14 w-14 rounded-full p-0"
                  onClick={handleToggleRecord}
                  disabled={isWaiting}
                >
                  {speech.isRecording ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
                <Button variant="outline" onClick={handleEndTache} disabled={isWaiting}>
                  <Square className="mr-2 h-4 w-4" />
                  {currentTache < 3 ? t("nextTache") : t("finishExam")}
                </Button>
              </div>
            </div>
          )}

          {/* Evaluating overlay */}
          {isEvaluating && (
            <div className="flex flex-col items-center gap-3 py-8">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground">
                {tc("evaluatingDescription")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

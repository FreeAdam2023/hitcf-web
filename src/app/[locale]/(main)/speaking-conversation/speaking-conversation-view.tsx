"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Mic, MicOff, Square, MessageCircle, Volume2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseUTCms } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { SceneBriefingCard } from "@/components/speaking/scene-briefing-card";
import { ConversationChat } from "@/components/speaking/conversation-chat";
import { useSpeechAssessment, type WordScore } from "@/hooks/use-speech-assessment";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useConversationWS } from "@/hooks/use-conversation-ws";
import { useStreamingTTS } from "@/hooks/use-streaming-tts";
import {
  startConversation,
  beginConversation,
  sendTurn,
  endConversation,
  getConversation,
} from "@/lib/api/speaking-conversation";
import type {
  SpeakingConversationResponse,
  ConversationTurnResponse,
} from "@/lib/api/types";

type Phase = "loading" | "prep" | "active" | "evaluating" | "completed";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSceneSsml(scenario: string, tacheType: number): string {
  const intro =
    tacheType === 3
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function SpeakingConversationView() {
  const t = useTranslations("speakingConversation");
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const testSetId = searchParams.get("testSetId") || "";
  const questionId = searchParams.get("questionId") || "";
  const urlSessionId = searchParams.get("sessionId") || "";

  // State
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<SpeakingConversationResponse | null>(
    null,
  );
  const [turns, setTurns] = useState<ConversationTurnResponse[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [prepTimer, setPrepTimer] = useState(0);
  const [useWS, setUseWS] = useState(true); // WS mode flag; false = HTTP fallback

  // Refs
  const sessionIdRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sceneTtsTriggered = useRef(false);
  const pendingTurnRef = useRef<{
    transcript: string;
    scores: Record<string, number> | null;
    wordScores: Array<{ word: string; accuracy: number; errorType: string }>;
  } | null>(null);

  // Hooks
  const speech = useSpeechAssessment();
  const tts = useSpeechSynthesis(); // Used for prep TTS + HTTP fallback
  const streamingTts = useStreamingTTS(); // Used for WS streaming TTS

  // ── WebSocket callbacks (stable refs via useCallback) ──

  const onStreamStart = useCallback(() => {
    setIsWaiting(false);
  }, []);

  const onStreamDelta = useCallback(
    (text: string) => {
      streamingTts.feedChunk(text);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onStreamEnd = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (fullText: string, _turnCount: number) => {
      streamingTts.finalize();

      // Add the pending user turn (if any) + examiner turn to the turns list
      const pending = pendingTurnRef.current;
      pendingTurnRef.current = null;

      const examinerTurn: ConversationTurnResponse = {
        role: "examiner",
        text: fullText,
        timestamp: new Date().toISOString(),
        pronunciation_scores: null,
        word_scores: [],
      };

      if (pending) {
        const userTurn: ConversationTurnResponse = {
          role: "user",
          text: pending.transcript,
          timestamp: new Date().toISOString(),
          pronunciation_scores: pending.scores,
          word_scores: pending.wordScores,
        };
        setTurns((prev) => [...prev, userTurn, examinerTurn]);
      } else {
        // begin_conversation: only examiner turn
        setTurns((prev) => [...prev, examinerTurn]);
      }

      setIsWaiting(false);
      speech.reset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onEnded = useCallback(() => {
    setPhase("evaluating");
  }, []);

  const onEvaluationDone = useCallback(() => {
    if (sessionIdRef.current) {
      router.push(`/speaking-conversation/results/${sessionIdRef.current}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onWSError = useCallback(
    (code: string, detail: string) => {
      toast.error(detail || code);
      setIsWaiting(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const ws = useConversationWS({
    onStreamStart,
    onStreamDelta,
    onStreamEnd,
    onEnded,
    onEvaluationDone,
    onError: onWSError,
  });

  // Fall back to HTTP when WS connection fails
  useEffect(() => {
    if (ws.connectionFailed && useWS) {
      setUseWS(false);
    }
  }, [ws.connectionFailed, useWS]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, []);

  // Resume an existing session fetched from the backend
  const resumeSession = useCallback(
    (conv: SpeakingConversationResponse) => {
      setSession(conv);
      sessionIdRef.current = conv.id;

      if (conv.status === "completed") {
        router.replace(`/speaking-conversation/results/${conv.id}`);
        return;
      }

      if (conv.status === "active") {
        // Restore turns and remaining timer
        setTurns(conv.turns);
        const elapsed = conv.conversation_started_at
          ? Math.floor(
              (Date.now() - parseUTCms(conv.conversation_started_at)) /
                1000,
            )
          : 0;
        const remaining = Math.max(0, conv.speaking_time_seconds - elapsed);

        // Timer expired — end session (handleEnd will redirect to results)
        if (remaining <= 0) {
          handleEnd();
          return;
        }

        setTimer(remaining);
        setPhase("active");

        // TTS: speak the last examiner message
        const lastExaminer = [...conv.turns]
          .reverse()
          .find((turn) => turn.role === "examiner");
        if (lastExaminer) {
          tts.speak(lastExaminer.text);
        }
        return;
      }

      // status === "pending" — calculate remaining prep time
      const prepElapsed = conv.started_at
        ? Math.floor(
            (Date.now() - parseUTCms(conv.started_at)) / 1000,
          )
        : 0;
      const remainingPrep = Math.max(0, conv.prep_time_seconds - prepElapsed);

      if (remainingPrep <= 0) {
        // Prep time expired during absence — set speaking timer then begin
        setTimer(conv.speaking_time_seconds);
        handleBegin();
        return;
      }
      setPrepTimer(remainingPrep);
      setTimer(conv.speaking_time_seconds);
      setPhase("prep");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Initialize session
  useEffect(() => {
    // Case 1: Resume existing session from URL
    if (urlSessionId) {
      getConversation(urlSessionId)
        .then((conv) => resumeSession(conv))
        .catch((err) => {
          toast.error(err.message || t("notFound"));
          router.push("/tests");
        });
      return;
    }

    // Case 2: Create new session
    if (!testSetId || !questionId) {
      toast.error(t("noTopic"));
      router.push("/tests");
      return;
    }

    startConversation({ test_set_id: testSetId, question_id: questionId })
      .then((conv) => {
        setSession(conv);
        sessionIdRef.current = conv.id;
        setPrepTimer(conv.prep_time_seconds);
        setTimer(conv.speaking_time_seconds);
        setPhase("prep");
        // Add sessionId to URL so refresh can resume
        router.replace(
          `/speaking-conversation?testSetId=${testSetId}&questionId=${questionId}&sessionId=${conv.id}`,
        );
      })
      .catch((err) => {
        toast.error(err.message || t("startFailed"));
        router.push("/tests");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect WebSocket when entering active phase
  useEffect(() => {
    if (phase === "active" && useWS && !ws.isConnected && !ws.connectionFailed) {
      ws.connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, useWS]);

  // Cleanup on unmount: stop audio, disconnect WS
  useEffect(() => {
    return () => {
      tts.stop();
      streamingTts.stop();
      ws.disconnect();
      if (speech.isRecording) speech.stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prep timer countdown
  useEffect(() => {
    if (phase !== "prep") return;

    prepTimerRef.current = setInterval(() => {
      setPrepTimer((prev) => {
        if (prev <= 1) {
          if (prepTimerRef.current) clearInterval(prepTimerRef.current);
          handleBegin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-trigger TTS to read scenario during prep phase (Tâche 2/3 only)
  useEffect(() => {
    if (phase !== "prep") return;
    if (!session?.scene_briefing?.scenario) return;
    if ((session.prep_time_seconds ?? 0) <= 0) return;
    if (sceneTtsTriggered.current) return;

    sceneTtsTriggered.current = true;
    const ssml = buildSceneSsml(
      session.scene_briefing.scenario,
      session.tache_type,
    );
    tts.speak(ssml, { ssml: true }).catch(() => {
      // Non-critical — prep still works without TTS
    });

    return () => {
      tts.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Speaking timer countdown
  useEffect(() => {
    if (phase !== "active") return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleEnd();
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

  // Begin conversation (after prep)
  const handleBegin = useCallback(async () => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    tts.stop(); // Stop scene TTS if still playing

    setPhase("active");

    // WS mode: wait for connection then send begin
    if (useWS) {
      // Connection might not be ready yet — the useEffect above will connect.
      // We use a small delay to let WS connect, then send begin.
      const waitForWS = async () => {
        // Wait up to 3s for connection
        for (let i = 0; i < 30; i++) {
          if (ws.isConnected) {
            ws.sendBegin(sessionIdRef.current);
            setIsWaiting(true);
            return;
          }
          if (ws.connectionFailed) break;
          await new Promise((r) => setTimeout(r, 100));
        }
        // Fallback to HTTP if WS not ready
        setUseWS(false);
        await handleBeginHTTP();
      };
      waitForWS();
      return;
    }

    await handleBeginHTTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWS, ws.isConnected, ws.connectionFailed]);

  // HTTP fallback for begin
  const handleBeginHTTP = useCallback(async () => {
    try {
      const result = await beginConversation(sessionIdRef.current);
      const examinerTurn: ConversationTurnResponse = {
        role: "examiner",
        text: result.examiner_text,
        timestamp: new Date().toISOString(),
        pronunciation_scores: null,
        word_scores: [],
      };
      setTurns([examinerTurn]);
      tts.speak(result.examiner_text);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("beginFailed");
      toast.error(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle recording
  const handleToggleRecord = useCallback(async () => {
    if (speech.isRecording) {
      // Stop recording → send turn
      speech.stopRecording();

      const transcript = speech.transcript;
      if (!transcript.trim()) return;

      const scores = speech.scores
        ? {
            accuracy: speech.scores.accuracy,
            fluency: speech.scores.fluency,
            completeness: speech.scores.completeness,
            prosody: speech.scores.prosody,
            overall: speech.scores.overall,
          }
        : null;
      const wordScores = speech.wordScores.map((w: WordScore) => ({
        word: w.word,
        accuracy: w.accuracy,
        errorType: w.errorType,
      }));

      setIsWaiting(true);

      // WS mode
      if (useWS && ws.isConnected) {
        pendingTurnRef.current = { transcript, scores, wordScores };
        ws.sendTurn({
          user_text: transcript,
          pronunciation_scores: scores,
          word_scores: wordScores,
        });
        return;
      }

      // HTTP fallback
      try {
        const result = await sendTurn(sessionIdRef.current, {
          user_text: transcript,
          pronunciation_scores: scores,
          word_scores: wordScores,
        });

        const userTurn: ConversationTurnResponse = {
          role: "user",
          text: transcript,
          timestamp: new Date().toISOString(),
          pronunciation_scores: scores,
          word_scores: wordScores,
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
        const message = err instanceof Error ? err.message : t("turnFailed");
        toast.error(message);
      } finally {
        setIsWaiting(false);
        speech.reset();
      }
    } else {
      // Start recording
      tts.stop();
      streamingTts.stop();
      speech.reset();
      await speech.startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.isRecording, speech.transcript, speech.scores, speech.wordScores, useWS, ws.isConnected]);

  // End conversation
  const handleEnd = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (speech.isRecording) speech.stopRecording();
    tts.stop();
    streamingTts.stop();

    setPhase("evaluating");

    // WS mode
    if (useWS && ws.isConnected) {
      ws.sendEnd();
      // onEnded + onEvaluationDone callbacks handle the rest
      return;
    }

    // HTTP fallback
    try {
      const conv = await endConversation(sessionIdRef.current);
      setSession(conv);
      router.push(`/speaking-conversation/results/${conv.id}`);
    } catch {
      toast.error(t("endFailed"));
      if (sessionIdRef.current) {
        router.push(
          `/speaking-conversation/results/${sessionIdRef.current}`,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.isRecording, useWS, ws.isConnected]);

  // ── Render ────────────────────────────────────────────────────────

  if (phase === "loading") return <LoadingSpinner />;

  const tacheLabel = session?.tache_type === 1 ? "Tâche 1" : session?.tache_type === 3 ? "Tâche 3" : "Tâche 2";
  const timerColor =
    phase === "active" && timer <= 30
      ? "text-destructive"
      : phase === "active" && timer <= 60
        ? "text-amber-600"
        : "text-foreground";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-28 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MessageCircle className="h-5 w-5 shrink-0 text-primary" />
          <h1 className="truncate text-lg font-semibold">
            {t("title")} · {tacheLabel}
          </h1>
        </div>
        <span className={`shrink-0 font-mono text-lg font-bold ${timerColor}`}>
          {phase === "prep"
            ? formatTime(prepTimer)
            : formatTime(timer)}
        </span>
      </div>

      {/* Phase badge */}
      <Badge variant="outline" className="w-fit">
        {phase === "prep" && t("prepPhase")}
        {phase === "active" && t("activePhase")}
        {phase === "evaluating" && t("evaluating")}
      </Badge>

      {/* Scene briefing */}
      {session?.scene_briefing && (
        <SceneBriefingCard briefing={session.scene_briefing} />
      )}

      {/* Prep phase: waiting screen */}
      {phase === "prep" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            {/* TTS indicator / replay */}
            {tts.isSpeaking ? (
              <div className="flex items-center gap-2 animate-in fade-in duration-700">
                <Volume2 className="h-4 w-4 animate-pulse text-primary" />
                <span className="text-sm font-medium text-primary">
                  {t("examinerReading")}
                </span>
              </div>
            ) : session?.scene_briefing?.scenario ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const ssml = buildSceneSsml(
                    session.scene_briefing!.scenario,
                    session.tache_type,
                  );
                  tts.speak(ssml, { ssml: true });
                }}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                {t("replayScenario")}
              </Button>
            ) : null}
            <p className="text-center text-sm text-muted-foreground">
              {t("prepDescription")}
            </p>
            <Button onClick={handleBegin}>{t("startEarly")}</Button>
          </CardContent>
        </Card>
      )}

      {/* Active phase: chat + controls */}
      {(phase === "active" || phase === "evaluating") && (
        <>
          <Card className="flex min-h-[400px] flex-col">
            <ConversationChat
              turns={turns}
              isWaiting={isWaiting}
              streamingExaminerText={ws.streamingText || undefined}
            />
          </Card>

          {/* Interim transcript */}
          {speech.isRecording && speech.transcript && (
            <div className="break-words rounded-md border border-blue-200 bg-blue-50/50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/20">
              <span className="text-muted-foreground">{t("youAreSaying")}:</span>{" "}
              {speech.transcript}
              {speech.interimTranscript && (
                <span className="text-muted-foreground">
                  {speech.interimTranscript}
                </span>
              )}
            </div>
          )}

          {/* Controls */}
          {phase === "active" && (
            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="mx-auto flex max-w-2xl items-center justify-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  variant={speech.isRecording ? "destructive" : "default"}
                  className="h-14 w-14 rounded-full p-0"
                  onClick={handleToggleRecord}
                  disabled={isWaiting || ws.isStreaming || phase !== "active"}
                >
                  {speech.isRecording ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEnd}
                  disabled={isWaiting || ws.isStreaming}
                >
                  <Square className="mr-2 h-4 w-4" />
                  {t("endConversation")}
                </Button>
              </div>
            </div>
          )}

          {/* Evaluating overlay */}
          {phase === "evaluating" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground">
                {t("evaluatingDescription")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

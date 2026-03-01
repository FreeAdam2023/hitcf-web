"use client";

import { useEffect, useRef } from "react";
import { Volume2, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import { useDictationStore, type DictationWord } from "@/stores/dictation-store";

interface DictationInputProps {
  word: DictationWord;
  onComplete: () => void;
}

export function DictationInput({ word, onComplete }: DictationInputProps) {
  const t = useTranslations();
  const { speak, playing } = useFrenchSpeech();
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const phase = useDictationStore((s) => s.phase);
  const userInput = useDictationStore((s) => s.userInput);
  const setUserInput = useDictationStore((s) => s.setUserInput);
  const submitAnswer = useDictationStore((s) => s.submitAnswer);
  const results = useDictationStore((s) => s.results);
  const lastResult = results[results.length - 1];

  // Auto-play on mount and when word changes
  useEffect(() => {
    if (phase === "listening") {
      speak(word.word, word.audio_url);
      // Transition to input phase after a brief delay
      const timer = setTimeout(() => {
        useDictationStore.setState({ phase: "input" });
        inputRef.current?.focus();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [word, phase, speak]);

  // Auto-advance after feedback
  useEffect(() => {
    if (phase === "feedback") {
      feedbackTimerRef.current = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(feedbackTimerRef.current);
    }
  }, [phase, onComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (phase === "input" && userInput.trim()) {
        submitAnswer();
      } else if (phase === "feedback") {
        clearTimeout(feedbackTimerRef.current);
        onComplete();
      }
    }
  };

  // Global keyboard handler for R=replay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        // Only replay if not typing in input
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          speak(word.word, word.audio_url);
        }
      }
      if (e.key === "Enter" && phase === "feedback") {
        clearTimeout(feedbackTimerRef.current);
        onComplete();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [word, speak, phase, onComplete]);

  const handleReplay = () => {
    speak(word.word, word.audio_url);
  };

  return (
    <div className="space-y-6">
      {/* Speaker button */}
      <div className="flex justify-center">
        <button
          onClick={handleReplay}
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all hover:bg-accent active:scale-95"
        >
          <Volume2 className={`h-10 w-10 ${playing ? "text-blue-500 animate-pulse" : "text-muted-foreground"}`} />
        </button>
      </div>

      {/* Input or feedback */}
      {phase === "listening" && (
        <div className="text-center text-muted-foreground text-sm">
          {t("vocabulary.dictation.replayHint")}
        </div>
      )}

      {(phase === "input" || phase === "feedback") && (
        <div className="space-y-3">
          <Input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("vocabulary.dictation.inputPlaceholder")}
            disabled={phase === "feedback"}
            className="text-center text-lg h-12"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          {phase === "feedback" && lastResult && (
            <div className="text-center space-y-2">
              {lastResult.isCorrect ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">{t("vocabulary.dictation.correct")}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <X className="h-5 w-5" />
                    <span className="font-medium">{t("vocabulary.dictation.incorrect")}</span>
                  </div>
                  <p className="text-sm">
                    {t("vocabulary.dictation.correctAnswer", { word: word.display_form || word.word })}
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{t("vocabulary.dictation.pressEnter")}</p>
            </div>
          )}

          {phase === "input" && (
            <p className="text-center text-xs text-muted-foreground">
              {t("vocabulary.dictation.replayHint")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

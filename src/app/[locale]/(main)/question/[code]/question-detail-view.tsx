"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, BookOpen, Share2, Check, Copy as CopyIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QuestionData {
  id: string;
  question_code: string;
  type: "listening" | "reading";
  level: string;
  question_number: number;
  passage: string | null;
  question_text: string | null;
  options: Array<{ key: string; text: string }>;
  correct_answer: string | null;
  transcript: string | null;
  audio_url: string | null;
  has_image: boolean;
}

interface Props {
  question: QuestionData;
  code: string;
}

const LEVEL_COLOR: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  A2: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  B2: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  C1: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  C2: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export function QuestionDetailView({ question, code }: Props) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const Icon = question.type === "listening" ? Headphones : BookOpen;
  const typeLabel =
    question.type === "listening" ? t("common.types.listening") : t("common.types.reading");

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">{code}</h1>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{typeLabel}</span>
              <Badge className={LEVEL_COLOR[question.level] || ""}>{question.level}</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Share2 className="mr-1.5 h-4 w-4" />}
          {copied ? t("common.actions.copied") : t("common.actions.share")}
        </Button>
      </div>

      {/* Audio (listening only) */}
      {question.type === "listening" && question.audio_url && (
        <Card className="p-4">
          <audio controls className="w-full" src={question.audio_url} />
        </Card>
      )}

      {/* Passage (reading only) */}
      {question.type === "reading" && question.passage && (
        <Card className="p-5">
          <div className="text-sm text-muted-foreground mb-2">{t("results.passage")}</div>
          <div className="whitespace-pre-wrap leading-relaxed">{question.passage}</div>
        </Card>
      )}

      {/* Question */}
      <Card className="p-5 space-y-4">
        {question.question_text && (
          <div className="text-base font-medium">{question.question_text}</div>
        )}

        <div className="space-y-2">
          {question.options.map((opt) => {
            const isCorrect = opt.key === question.correct_answer;
            const showHighlight = showAnswer && isCorrect;
            return (
              <div
                key={opt.key}
                className={`rounded-lg border p-3 transition-colors ${
                  showHighlight
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-border bg-muted/30"
                }`}
              >
                <span className="font-bold mr-2">{opt.key}.</span>
                <span>{opt.text || <em className="text-muted-foreground">（音频选项）</em>}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => setShowAnswer(!showAnswer)}>
            {showAnswer ? t("results.hideAnswer") : t("results.showAnswer")}
          </Button>
          {showAnswer && (
            <span className="text-sm">
              <span className="text-muted-foreground">{t("results.answer")}:</span>{" "}
              <Badge className="font-mono">{question.correct_answer}</Badge>
            </span>
          )}
        </div>
      </Card>

      {/* Transcript (listening only, after answer reveal) */}
      {question.type === "listening" && question.transcript && showAnswer && (
        <Card className="p-5">
          <div className="text-sm text-muted-foreground mb-2">{t("results.transcript")}</div>
          <div className="whitespace-pre-wrap leading-relaxed text-sm">{question.transcript}</div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground text-center pt-2 flex items-center justify-center gap-2">
        <CopyIcon className="h-3 w-3" />
        <span>HiTCF · {code}</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, X, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { OptionList } from "@/components/practice/option-list";
import { AudioPlayer } from "@/components/practice/audio-player";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import type { ReviewAnswer, AnswerResponse } from "@/lib/api/types";
import { getTcfPoints } from "@/lib/tcf-levels";

interface QuestionReviewItemProps {
  answer: ReviewAnswer;
}

export function QuestionReviewItem({ answer }: QuestionReviewItemProps) {
  const [open, setOpen] = useState(false);

  // Build an AnswerResponse for OptionList (practice mode = show green/red)
  const answerResponse: AnswerResponse = {
    question_id: answer.question_id,
    question_number: answer.question_number,
    selected: answer.selected,
    is_correct: answer.is_correct,
    correct_answer: answer.correct_answer,
  };

  const isListening = answer.type === "listening";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors">
        {/* Question number badge + points */}
        <Badge variant="outline" className="shrink-0 tabular-nums">
          #{answer.question_number}
        </Badge>
        {(answer.type === "listening" || answer.type === "reading") && (
          <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
            {getTcfPoints(answer.question_number)}分
          </span>
        )}

        {/* Correct/wrong icon */}
        {answer.is_correct === true && (
          <Check className="h-4 w-4 shrink-0 text-green-500" />
        )}
        {answer.is_correct === false && (
          <X className="h-4 w-4 shrink-0 text-red-500" />
        )}
        {answer.is_correct === null && (
          <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        {/* Level badge */}
        {answer.level && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            {answer.level}
          </Badge>
        )}

        {/* Selection info */}
        <span className="flex-1 text-left">
          <span
            className={cn(
              "font-medium",
              answer.is_correct === true && "text-green-600",
              answer.is_correct === false && "text-red-600",
            )}
          >
            {answer.selected || "未作答"}
          </span>
        </span>

        {/* Correct answer when wrong */}
        {answer.is_correct === false && answer.correct_answer && (
          <span className="text-muted-foreground">
            正确: <span className="font-medium text-green-600">{answer.correct_answer}</span>
          </span>
        )}

        {/* Expand indicator */}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-4 border-t px-4 py-4 bg-muted/20">
          {/* Passage */}
          {answer.passage && (
            <div className="rounded-md border bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {answer.passage}
            </div>
          )}

          {/* Question text */}
          {answer.question_text && (
            <p className="text-base font-medium">{answer.question_text}</p>
          )}

          {/* Options with correct/wrong highlighting */}
          {answer.options.length > 0 && (
            <OptionList
              options={answer.options}
              answer={answerResponse}
              onSelect={() => {}}
              disabled
              mode="practice"
            />
          )}

          {/* Audio player for listening questions */}
          {isListening && answer.audio_url && (
            <AudioPlayer questionId={answer.question_id} />
          )}

          {/* Transcript (full audio content: dialogue + spoken options) */}
          {isListening && (answer.transcript || answer.options.length > 0) && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">听力原文</h4>
              <div className="rounded-md border bg-muted/50 p-3 text-sm leading-relaxed">
                {answer.transcript && (
                  <p className="whitespace-pre-wrap">{answer.transcript}</p>
                )}
                {answer.options.length > 0 && (
                  <div className={answer.transcript ? "mt-2 border-t border-border/50 pt-2" : ""}>
                    <div className="space-y-0.5 text-muted-foreground">
                      {answer.options.map((opt) => (
                        <p key={opt.key}>
                          <span className="font-medium text-foreground">{opt.key}.</span> {opt.text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Explanation */}
          <ExplanationPanel explanation={answer.explanation} questionId={answer.question_id} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

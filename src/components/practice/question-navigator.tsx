"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { AnswerResponse } from "@/lib/api/types";
import { LevelBadge } from "@/components/shared/level-badge";

const PAGE_SIZE = 50;

interface QuestionMeta {
  type: string;
  level: string | null;
}

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  answers: Map<string, AnswerResponse> | Map<string, unknown>;
  questionIds: string[];
  onNavigate: (index: number) => void;
  mode?: "practice" | "exam";
  flaggedQuestions?: Set<number>;
  questions?: QuestionMeta[];
  previouslyAnsweredIds?: Set<string>;
}

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function QuestionNavigator({
  total,
  currentIndex,
  answers,
  questionIds,
  onNavigate,
  mode = "practice",
  flaggedQuestions,
  questions,
  previouslyAnsweredIds,
}: QuestionNavigatorProps) {
  const t = useTranslations();
  const isExam = mode === "exam";
  const isListeningOrReading = questions?.[0]?.type === "listening" || questions?.[0]?.type === "reading";
  const useGrouped = !isExam && isListeningOrReading && questions && questions.length > 0;

  function renderButton(i: number) {
    const qid = questionIds[i];
    const answer = qid ? answers.get(qid) : undefined;
    const isCurrent = i === currentIndex;
    const isAnswered = !!answer;
    const questionNum = i + 1;
    const isFlagged = isExam && flaggedQuestions?.has(questionNum);
    const isPrevAnswered = !isAnswered && !!qid && !!previouslyAnsweredIds?.has(qid);

    const typedAnswer = answer as AnswerResponse | undefined;
    const isCorrect = !isExam && !!typedAnswer && typedAnswer.is_correct === true;
    const isWrong = !isExam && !!typedAnswer && typedAnswer.is_correct === false;

    let statusLabel = t("practice.navigator.unanswered");
    if (isCorrect) statusLabel = t("practice.navigator.correct");
    else if (isWrong) statusLabel = t("practice.navigator.wrong");
    else if (isAnswered) statusLabel = t("practice.navigator.answered");

    return (
      <button
        key={i}
        onClick={() => onNavigate(i)}
        aria-label={t("practice.navigator.questionLabel", { n: questionNum, status: statusLabel })}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors",
          isCurrent && "ring-2 ring-primary ring-offset-1",
          !isExam && isCorrect && "bg-green-500 text-white",
          !isExam && isWrong && "bg-red-500 text-white",
          isExam && isAnswered && "bg-primary text-primary-foreground",
          !isExam && isAnswered && !isCorrect && !isWrong && "bg-primary text-primary-foreground",
          !isAnswered && !isCurrent && isPrevAnswered && "bg-muted text-muted-foreground/70 hover:bg-accent",
          !isAnswered && !isCurrent && !isPrevAnswered && "bg-muted hover:bg-accent",
          !isAnswered && isCurrent && "bg-primary/20",
        )}
      >
        {isCorrect ? "✓" : isWrong ? "✗" : questionNum}
        {isFlagged && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500" />
        )}
        {isPrevAnswered && (
          <span className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blue-400" />
        )}
      </button>
    );
  }

  if (useGrouped) {
    // Group question indices by level
    const groups: { level: string; indices: number[] }[] = [];
    let currentGroup: { level: string; indices: number[] } | null = null;

    for (let i = 0; i < questions.length; i++) {
      const level = questions[i].level?.toUpperCase() ?? t("common.status.unknown");
      if (!currentGroup || currentGroup.level !== level) {
        currentGroup = { level, indices: [i] };
        groups.push(currentGroup);
      } else {
        currentGroup.indices.push(i);
      }
    }

    // Sort groups by CEFR level order
    groups.sort((a, b) => {
      const ai = LEVEL_ORDER.indexOf(a.level);
      const bi = LEVEL_ORDER.indexOf(b.level);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    // For large sets (e.g. 1600+ questions), fall through to paginated flat grid
    if (total > PAGE_SIZE) {
      return (
        <PaginatedGrid
          total={total}
          currentIndex={currentIndex}
          answers={answers}
          renderButton={renderButton}
          t={t}
        />
      );
    }

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{t("practice.navigator.title")}</h3>
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.level}>
              <div className="mb-1.5">
                <LevelBadge level={group.level} size="sm" />
              </div>
              <div className="flex flex-wrap gap-1.5 p-0.5">
                {group.indices.map((i) => renderButton(i))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {t("common.answeredProgress", { answered: answers.size, total })}
        </p>
      </div>
    );
  }

  // Flat grid (reading, exam, or no questions metadata) — paginated if large
  return (
    <PaginatedGrid
      total={total}
      currentIndex={currentIndex}
      answers={answers}
      renderButton={renderButton}
      t={t}
    />
  );
}

/* ── Paginated flat grid ── */

function PaginatedGrid({
  total,
  currentIndex,
  answers,
  renderButton,
  t,
}: {
  total: number;
  currentIndex: number;
  answers: Map<string, unknown>;
  renderButton: (i: number) => React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const needsPaging = total > PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(currentIndex / PAGE_SIZE);

  const [page, setPage] = useState(currentPage);

  // Auto-follow when user navigates to a question on a different page
  useEffect(() => {
    const targetPage = Math.floor(currentIndex / PAGE_SIZE);
    if (targetPage !== page) setPage(targetPage);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = needsPaging ? page * PAGE_SIZE : 0;
  const end = needsPaging ? Math.min(start + PAGE_SIZE, total) : total;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{t("practice.navigator.title")}</h3>
      {needsPaging && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-0.5 hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span>
            {start + 1}–{end} / {total}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="inline-flex items-center gap-0.5 hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 p-0.5">
        {Array.from({ length: end - start }, (_, j) => renderButton(start + j))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("common.answeredProgress", { answered: answers.size, total })}
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Headphones, BookOpen, Shuffle, Layers } from "lucide-react";
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
  previousAnswers?: Map<string, AnswerResponse>;
}

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TYPE_LABELS: Record<string, { icon: typeof Headphones; label: string }> = {
  listening: { icon: Headphones, label: "common.types.listening" },
  reading: { icon: BookOpen, label: "common.types.reading" },
};

export function QuestionNavigator({
  total,
  currentIndex,
  answers,
  questionIds,
  onNavigate,
  mode = "practice",
  flaggedQuestions,
  questions,
  previousAnswers,
}: QuestionNavigatorProps) {
  const t = useTranslations();
  const isExam = mode === "exam";
  const isListeningOrReading = questions?.[0]?.type === "listening" || questions?.[0]?.type === "reading";
  const useGrouped = !isExam && isListeningOrReading && questions && questions.length > 0;
  const totalAnswered = previousAnswers
    ? new Set([...Array.from(answers.keys()), ...Array.from(previousAnswers.keys())]).size
    : answers.size;

  // Detect mixed types (wrong answer practice with both listening + reading)
  const types = questions ? new Set(questions.map((q) => q.type)) : new Set<string>();
  const isMixedType = types.size > 1;
  const [groupByType, setGroupByType] = useState(true);

  function renderButton(i: number) {
    const qid = questionIds[i];
    const answer = qid ? answers.get(qid) : undefined;
    const prevAnswer = !answer && qid ? previousAnswers?.get(qid) : undefined;
    const effectiveAnswer = (answer ?? prevAnswer) as AnswerResponse | undefined;
    const isCurrent = i === currentIndex;
    const isAnswered = !!effectiveAnswer;
    const questionNum = i + 1;
    const isFlagged = isExam && flaggedQuestions?.has(questionNum);

    const isCorrect = !isExam && !!effectiveAnswer && effectiveAnswer.is_correct === true;
    const isWrong = !isExam && !!effectiveAnswer && effectiveAnswer.is_correct === false;

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
          !isAnswered && !isCurrent && "bg-muted hover:bg-accent",
          !isAnswered && isCurrent && "bg-primary/20",
        )}
      >
        {isCorrect ? "✓" : isWrong ? "✗" : questionNum}
        {isFlagged && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500" />
        )}
      </button>
    );
  }

  // Mixed-type display (wrong answer practice with listening + reading)
  if (useGrouped && isMixedType) {
    // Group by type
    const typeGroups: { type: string; indices: number[] }[] = [];
    let curType: string | null = null;
    let curGroup: { type: string; indices: number[] } | null = null;

    for (let i = 0; i < questions.length; i++) {
      const qType = questions[i].type;
      if (qType !== curType) {
        curType = qType;
        curGroup = { type: qType, indices: [i] };
        typeGroups.push(curGroup);
      } else {
        curGroup!.indices.push(i);
      }
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{t("practice.navigator.title")}</h3>
          <button
            onClick={() => setGroupByType((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={groupByType ? t("practice.navigator.showMixed") : t("practice.navigator.showGrouped")}
          >
            {groupByType ? <Shuffle className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
          </button>
        </div>
        {groupByType ? (
          <div className="space-y-3">
            {typeGroups.map((group) => {
              const meta = TYPE_LABELS[group.type];
              const Icon = meta?.icon;
              return (
                <div key={group.type}>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    <span>{meta ? t(meta.label) : group.type}</span>
                    <span className="text-muted-foreground/60">({group.indices.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-0.5">
                    {group.indices.map((i) => renderButton(i))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-0.5">
            {Array.from({ length: total }, (_, i) => renderButton(i))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {t("common.answeredProgress", { answered: totalAnswered, total })}
        </p>
      </div>
    );
  }

  if (useGrouped) {
    // Group question indices by level (single-type: listening or reading)
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
          totalAnswered={totalAnswered}
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
          {t("common.answeredProgress", { answered: totalAnswered, total })}
        </p>
      </div>
    );
  }

  // Flat grid (reading, exam, or no questions metadata) — paginated if large
  return (
    <PaginatedGrid
      total={total}
      currentIndex={currentIndex}
      totalAnswered={totalAnswered}
      renderButton={renderButton}
      t={t}
    />
  );
}

/* ── Paginated flat grid ── */

function PaginatedGrid({
  total,
  currentIndex,
  totalAnswered,
  renderButton,
  t,
}: {
  total: number;
  currentIndex: number;
  totalAnswered: number;
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
        {t("common.answeredProgress", { answered: totalAnswered, total })}
      </p>
    </div>
  );
}

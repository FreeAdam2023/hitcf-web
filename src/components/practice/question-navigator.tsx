"use client";

import { cn } from "@/lib/utils";
import type { AnswerResponse } from "@/lib/api/types";
import { LevelBadge } from "@/components/shared/level-badge";

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
}: QuestionNavigatorProps) {
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

    const typedAnswer = answer as AnswerResponse | undefined;
    const isCorrect = !isExam && !!typedAnswer && typedAnswer.is_correct === true;
    const isWrong = !isExam && !!typedAnswer && typedAnswer.is_correct === false;

    let statusLabel = "未答";
    if (isCorrect) statusLabel = "正确";
    else if (isWrong) statusLabel = "错误";
    else if (isAnswered) statusLabel = "已答";

    return (
      <button
        key={i}
        onClick={() => onNavigate(i)}
        aria-label={`第${questionNum}题，${statusLabel}`}
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

  if (useGrouped) {
    // Group question indices by level
    const groups: { level: string; indices: number[] }[] = [];
    let currentGroup: { level: string; indices: number[] } | null = null;

    for (let i = 0; i < questions.length; i++) {
      const level = questions[i].level?.toUpperCase() ?? "未知";
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

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">题号导航</h3>
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
          已答 {answers.size} / {total}
        </p>
      </div>
    );
  }

  // Flat grid (reading, exam, or no questions metadata)
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">题号导航</h3>
      <div className="flex flex-wrap gap-1.5 p-0.5">
        {Array.from({ length: total }, (_, i) => renderButton(i))}
      </div>
      <p className="text-xs text-muted-foreground">
        已答 {answers.size} / {total}
      </p>
    </div>
  );
}

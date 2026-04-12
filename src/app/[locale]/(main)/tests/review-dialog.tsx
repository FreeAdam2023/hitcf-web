"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { startSmartPractice } from "@/lib/api/smart-practice";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const COUNT_OPTIONS = [10, 30, 0]; // 0 = all answered

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "listening" | "reading";
}

export function ReviewDialog({ open, onOpenChange, type }: Props) {
  const t = useTranslations();
  const router = useRouter();

  const [count, setCount] = useState(0); // 0 = all
  const [structured, setStructured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const size = count === 0 ? 39 : count;
      const res = await startSmartPractice({
        type,
        size,
        review: true,
        structured,
      });
      if (!res.total) {
        setError(t("tests.noReviewQuestions"));
        setLoading(false);
        return;
      }
      onOpenChange(false);
      router.push(`/practice/${res.attempt_id}`);
    } catch {
      setError(t("tests.noReviewQuestions"));
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {t("tests.randomReview")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Mode selection */}
          <div>
            <p className="mb-2.5 text-sm font-medium text-muted-foreground">
              {t("tests.reviewMode")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setStructured(false)}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
                  !structured
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {t("tests.reviewFree")}
              </button>
              <button
                onClick={() => setStructured(true)}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
                  structured
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {t("tests.reviewStructured")}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground/60">
              {structured
                ? t("tests.reviewStructuredHint")
                : t("tests.reviewFreeHint")}
            </p>
          </div>

          {/* Count selection */}
          <div>
            <p className="mb-2.5 text-sm font-medium text-muted-foreground">
              {t("speedDrill.questionCount")}
            </p>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cn(
                    "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
                    count === n
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n === 0
                    ? t("speedDrill.allQuestions")
                    : t("speedDrill.questionsLabel", { count: n })}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={loading}
          >
            <Play className="mr-1.5 h-4 w-4" />
            {loading
              ? t("speedDrill.generating")
              : t("tests.startReview")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

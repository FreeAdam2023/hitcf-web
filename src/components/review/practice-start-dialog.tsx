"use client";

import { useState } from "react";
import { Loader2, BookOpen, Headphones, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: Array<{ key: string; Icon?: LucideIcon }> = [
  { key: "all" },
  { key: "listening", Icon: Headphones },
  { key: "reading", Icon: BookOpen },
];

const COUNT_OPTIONS = [10, 20, 30, 0] as const; // 0 = all

interface PracticeStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "wrong" | "bookmark";
  totalCount: number;
  loading?: boolean;
  onStart: (type: string | undefined, limit: number | undefined) => void;
}

export function PracticeStartDialog({
  open,
  onOpenChange,
  mode,
  totalCount,
  loading,
  onStart,
}: PracticeStartDialogProps) {
  const t = useTranslations();
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCount, setSelectedCount] = useState<number>(0); // 0 = all

  const effectiveCount =
    selectedCount === 0 || selectedCount > totalCount
      ? totalCount
      : selectedCount;

  const handleStart = () => {
    onStart(
      selectedType === "all" ? undefined : selectedType,
      selectedCount === 0 ? undefined : selectedCount,
    );
  };

  const title =
    mode === "wrong"
      ? t("review.practiceDialog.wrongTitle")
      : t("review.practiceDialog.bookmarkTitle");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "wrong" ? (
              <BookOpen className="h-5 w-5 text-red-500" />
            ) : (
              <Star className="h-5 w-5 text-yellow-500" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>
            {t("review.practiceDialog.description", { count: totalCount })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Type filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("review.practiceDialog.typeLabel")}
            </label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    selectedType === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {key === "all"
                    ? t("review.practiceDialog.all")
                    : t(`common.types.${key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Count selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("review.practiceDialog.countLabel")}
            </label>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map((count) => {
                const isAll = count === 0;
                const label = isAll
                  ? t("review.practiceDialog.all")
                  : `${count}`;
                const isDisabled = !isAll && count > totalCount;
                return (
                  <button
                    key={count}
                    onClick={() => !isDisabled && setSelectedCount(count)}
                    disabled={isDisabled}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      selectedCount === count
                        ? "bg-primary text-primary-foreground"
                        : isDisabled
                          ? "bg-muted text-muted-foreground/40 cursor-not-allowed"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={loading || totalCount === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {t("wrongAnswers.generating")}
              </>
            ) : (
              t("review.practiceDialog.start", { count: effectiveCount })
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

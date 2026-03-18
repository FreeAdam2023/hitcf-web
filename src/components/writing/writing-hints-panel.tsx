"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Lightbulb, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getWritingHints } from "@/lib/api/writing";
import { insertTextAtCursor } from "@/lib/textarea-utils";
import type { WritingHintCard } from "@/lib/api/types";

interface WritingHintsPanelProps {
  questionId: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onPanelOpenChange?: (open: boolean) => void;
}

const ANGLE_COLORS: Record<string, string> = {
  location: "border-l-blue-500",
  price: "border-l-green-500",
  service: "border-l-purple-500",
  quality: "border-l-amber-500",
  experience: "border-l-pink-500",
  comparison: "border-l-cyan-500",
  advantage: "border-l-emerald-500",
  disadvantage: "border-l-red-500",
};

function getAngleColor(angle: string): string {
  const lower = angle.toLowerCase();
  for (const [key, cls] of Object.entries(ANGLE_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  const colors = [
    "border-l-blue-500",
    "border-l-green-500",
    "border-l-purple-500",
    "border-l-amber-500",
    "border-l-pink-500",
    "border-l-cyan-500",
    "border-l-emerald-500",
    "border-l-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < angle.length; i++) {
    hash = (hash * 31 + angle.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

// In-memory cache keyed by questionId — survives re-renders and re-mounts
const _hintsCache = new Map<string, WritingHintCard[]>();

export function WritingHintsPanel({ questionId, textareaRef, onPanelOpenChange }: WritingHintsPanelProps) {
  const t = useTranslations("writingHints");
  const [cards, setCards] = useState<WritingHintCard[]>(
    () => _hintsCache.get(questionId) ?? [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fetchedRef = useRef<Set<string>>(new Set());

  const fetchHints = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getWritingHints(questionId);
      setCards(result.cards);
      _hintsCache.set(questionId, result.cards);
      fetchedRef.current.add(questionId);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onPanelOpenChange?.(open);
      if (open && !fetchedRef.current.has(questionId) && !_hintsCache.has(questionId) && !loading) {
        fetchHints();
      } else if (open && _hintsCache.has(questionId)) {
        setCards(_hintsCache.get(questionId)!);
      }
    },
    [questionId, loading, fetchHints, onPanelOpenChange],
  );

  const handleInsert = (phrase: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    requestAnimationFrame(() => {
      insertTextAtCursor(textarea, phrase);
    });
  };

  return (
    <Sheet onOpenChange={handleOpenChange} modal={false}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Lightbulb className="h-3.5 w-3.5" />
          {t("trigger")}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[340px] sm:w-[400px] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle className="text-base">{t("title")}</SheetTitle>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          {loading && (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg border-l-4 border-l-muted p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-muted-foreground">{t("loading")}</p>
            </>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-2 py-8">
              <p className="text-sm text-muted-foreground">{t("error")}</p>
              <Button variant="outline" size="sm" onClick={fetchHints}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                {t("retry")}
              </Button>
            </div>
          )}

          {!loading && !error && cards.map((card, i) => (
            <div
              key={i}
              className={`space-y-1.5 rounded-lg border-l-4 bg-muted/30 p-3 ${getAngleColor(card.angle)}`}
            >
              <div>
                <p className="text-sm font-medium">{card.title_fr}</p>
                <p className="text-xs text-muted-foreground">{card.title_native}</p>
              </div>
              {card.brief && (
                <p className="text-xs text-muted-foreground">{card.brief}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {card.key_phrases.map((phrase, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => handleInsert(phrase)}
                    className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
                    title={phrase}
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

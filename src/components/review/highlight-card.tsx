"use client";

import { useState } from "react";
import { Highlighter, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { updateHighlight } from "@/lib/api/highlights";
import { toast } from "sonner";
import type { HighlightItem } from "@/lib/api/types";
import { TYPE_COLORS } from "@/lib/constants";

const COLOR_CLASSES: Record<string, string> = {
  yellow: "bg-yellow-200/60 dark:bg-yellow-900/40",
  green: "bg-green-200/60 dark:bg-green-900/40",
  blue: "bg-blue-200/60 dark:bg-blue-900/40",
};

const COLOR_BORDER: Record<string, string> = {
  yellow: "border-l-yellow-400",
  green: "border-l-green-400",
  blue: "border-l-blue-400",
};

interface HighlightCardProps {
  item: HighlightItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<HighlightItem>) => void;
}

export function HighlightCard({ item, onDelete, onUpdate }: HighlightCardProps) {
  const t = useTranslations();
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(item.note || "");
  const [saving, setSaving] = useState(false);

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      const note = noteText.trim() || null;
      await updateHighlight(item.id, { note });
      onUpdate(item.id, { note });
      setEditing(false);
    } catch {
      toast.error(t("common.errors.operationFailed"));
    } finally {
      setSaving(false);
    }
  };

  const source = [
    item.test_set_name,
    item.question_number ? `Q${item.question_number}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const timeAgo = item.created_at
    ? new Date(item.created_at).toLocaleDateString()
    : "";

  return (
    <Card className={cn("overflow-hidden border-l-4", COLOR_BORDER[item.color] || COLOR_BORDER.yellow)}>
      <CardContent className="space-y-2 pt-4">
        {/* Highlighted text */}
        <div className={cn("rounded-md px-3 py-2", COLOR_CLASSES[item.color] || COLOR_CLASSES.yellow)}>
          <p className="text-sm leading-relaxed">{item.text}</p>
        </div>

        {/* Note */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNoteText(e.target.value)}
              placeholder={t("review.highlights.notePlaceholder")}
              className="min-h-[60px] w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={1000}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveNote} disabled={saving}>
                {t("review.highlights.save")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setNoteText(item.note || "");
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : item.note ? (
          <p
            className="cursor-pointer rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            onClick={() => setEditing(true)}
          >
            {item.note}
          </p>
        ) : null}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
              >
                {t(`review.highlights.tags.${tag}`)}
              </span>
            ))}
          </div>
        )}

        {/* Footer: metadata + actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {item.question_type && (
              <Badge
                variant="outline"
                className={cn("text-[10px]", TYPE_COLORS[item.question_type]?.badge ?? "")}
              >
                {t(`common.types.${item.question_type}`)}
              </Badge>
            )}
            {item.level && <Badge variant="secondary" className="text-[10px]">{item.level}</Badge>}
            {source && <span>{source}</span>}
            {timeAgo && <span>· {timeAgo}</span>}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEditing(true);
                setNoteText(item.note || "");
              }}
            >
              {item.note ? (
                <Pencil className="h-3.5 w-3.5" />
              ) : (
                <Highlighter className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitFeedback } from "@/lib/api/feedback";

const CATEGORY_VALUES = ["bug", "feature", "content", "other"] as const;

const CATEGORY_KEYS: Record<string, string> = {
  bug: "feedback.bug",
  feature: "feedback.feature",
  content: "feedback.content",
  other: "feedback.other",
};

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const t = useTranslations();
  const [category, setCategory] = useState<string>("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!category) return;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await submitFeedback({
        category: category as "bug" | "feature" | "content" | "other",
        content: content.trim(),
        page_url: window.location.pathname,
      });
      toast.success(t("feedback.success"));
      onOpenChange(false);
      setCategory("");
      setContent("");
    } catch {
      toast.error(t("feedback.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("feedback.title")}</DialogTitle>
          <DialogDescription>{t("feedback.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("feedback.categoryLabel")}
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("feedback.categoryPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(CATEGORY_KEYS[value])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("feedback.contentLabel")}
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t("feedback.contentPlaceholder")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("feedback.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !category || !content.trim()}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("feedback.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

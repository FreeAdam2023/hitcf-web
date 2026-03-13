"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Camera, X, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toPng } from "html-to-image";
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
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const screenshotTakenRef = useRef(false);

  const captureScreenshot = useCallback(async () => {
    setCapturing(true);
    try {
      const body = document.body;
      const dataUrl = await toPng(body, {
        cacheBust: true,
        width: window.innerWidth,
        height: window.innerHeight,
        style: {
          overflow: "hidden",
          height: `${window.innerHeight}px`,
        },
        filter: (node: HTMLElement) => {
          // Exclude the feedback dialog and FAB from screenshot
          if (node.getAttribute?.("data-feedback-exclude")) return false;
          // Exclude radix dialog overlay/content
          if (node.getAttribute?.("role") === "dialog") return false;
          if (node.classList?.contains("fixed") && node.getAttribute?.("data-state") === "open")
            return false;
          return true;
        },
      });
      setScreenshot(dataUrl);
    } catch {
      // Silently fail — screenshot is optional
    } finally {
      setCapturing(false);
    }
  }, []);

  // Auto-capture screenshot when dialog opens
  useEffect(() => {
    if (open && !screenshotTakenRef.current) {
      screenshotTakenRef.current = true;
      // Small delay to let the dialog render first, then capture background
      const timer = setTimeout(() => captureScreenshot(), 100);
      return () => clearTimeout(timer);
    }
    if (!open) {
      screenshotTakenRef.current = false;
    }
  }, [open, captureScreenshot]);

  const handleSubmit = async () => {
    if (!category) return;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await submitFeedback({
        category: category as "bug" | "feature" | "content" | "other",
        content: content.trim(),
        page_url: window.location.href,
        screenshot: screenshot ?? undefined,
      });
      toast.success(t("feedback.success"));
      onOpenChange(false);
      setCategory("");
      setContent("");
      setScreenshot(null);
    } catch {
      toast.error(t("feedback.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" data-feedback-exclude>
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

          {/* Screenshot section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />
                {t("feedback.screenshot")}
              </label>
              {screenshot && (
                <button
                  onClick={() => setScreenshot(null)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  {t("feedback.removeScreenshot")}
                </button>
              )}
            </div>
            {capturing ? (
              <div className="flex items-center justify-center h-20 rounded-md border border-dashed border-border bg-muted/30">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : screenshot ? (
              <div className="relative rounded-md border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshot}
                  alt="Screenshot"
                  className="w-full h-auto max-h-40 object-cover object-top"
                />
              </div>
            ) : (
              <button
                onClick={captureScreenshot}
                className="flex items-center justify-center gap-2 w-full h-20 rounded-md border border-dashed border-border bg-muted/30 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <ImageIcon className="h-4 w-4" />
                {t("feedback.captureScreenshot")}
              </button>
            )}
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

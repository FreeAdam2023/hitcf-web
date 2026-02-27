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
import { reportQuestion } from "@/lib/api/reports";
import { ApiError } from "@/lib/api/client";

const ISSUE_TYPE_VALUES = ["wrong_answer", "bad_audio", "wrong_option", "other"] as const;

const ISSUE_TYPE_KEYS: Record<string, string> = {
  wrong_answer: "practice.report.types.wrong_answer",
  bad_audio: "practice.report.types.audio_issue",
  wrong_option: "practice.report.types.option_error",
  other: "practice.report.types.other",
};

interface ReportDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ questionId, open, onOpenChange }: ReportDialogProps) {
  const t = useTranslations();
  const [issueType, setIssueType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!issueType) {
      toast.error(t("practice.report.selectType"));
      return;
    }
    setSubmitting(true);
    try {
      await reportQuestion(questionId, {
        issue_type: issueType as "wrong_answer" | "bad_audio" | "wrong_option" | "other",
        description: description.trim() || undefined,
      });
      toast.success(t("practice.report.success"));
      onOpenChange(false);
      setIssueType("");
      setDescription("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(t("practice.report.duplicate"));
      } else {
        toast.error(t("common.errors.submitFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("practice.report.title")}</DialogTitle>
          <DialogDescription>
            {t("practice.report.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("practice.report.typeLabel")}</label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder={t("practice.report.typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPE_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(ISSUE_TYPE_KEYS[value])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("practice.report.detailLabel")}</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t("practice.report.detailPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("practice.report.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !issueType}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("practice.report.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

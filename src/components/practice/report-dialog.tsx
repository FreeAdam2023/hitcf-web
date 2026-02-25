"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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

const ISSUE_TYPES = [
  { value: "wrong_answer", label: "答案错误" },
  { value: "bad_audio", label: "音频有问题" },
  { value: "wrong_option", label: "选项内容错误" },
  { value: "other", label: "其他问题" },
] as const;

interface ReportDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ questionId, open, onOpenChange }: ReportDialogProps) {
  const [issueType, setIssueType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!issueType) {
      toast.error("请选择问题类型");
      return;
    }
    setSubmitting(true);
    try {
      await reportQuestion(questionId, {
        issue_type: issueType as "wrong_answer" | "bad_audio" | "wrong_option" | "other",
        description: description.trim() || undefined,
      });
      toast.success("反馈已提交，感谢您的帮助！");
      onOpenChange(false);
      setIssueType("");
      setDescription("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("您已反馈过该问题类型");
      } else {
        toast.error("提交失败，请重试");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>题目报错</DialogTitle>
          <DialogDescription>
            发现题目有问题？请选择问题类型并描述具体情况。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">问题类型</label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder="请选择问题类型" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">详细描述（可选）</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="请描述具体问题..."
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
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !issueType}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            提交反馈
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

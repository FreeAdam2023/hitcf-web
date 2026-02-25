"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, FileText, Lock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { createAttempt } from "@/lib/api/attempts";
import { cn } from "@/lib/utils";
import { TYPE_COLORS } from "@/lib/constants";
import type { TestSetItem } from "@/lib/api/types";

export function TestCard({ test }: { test: TestSetItem }) {
  const router = useRouter();
  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const locked = !test.is_free && !canAccessPaid;

  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startingExam, setStartingExam] = useState(false);

  const handleLockedClick = () => router.push("/pricing");
  const handleLockedKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push("/pricing");
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const attempt = await createAttempt({ test_set_id: test.id, mode: "practice" });
      router.push(`/practice/${attempt.id}`);
    } catch {
      toast.error("创建练习失败，请重试");
      setStarting(false);
    }
  };

  const handleStartExam = async () => {
    setStartingExam(true);
    try {
      const attempt = await createAttempt({ test_set_id: test.id, mode: "exam" });
      router.push(`/exam/${attempt.id}`);
    } catch {
      toast.error("创建考试失败，请重试");
      setStartingExam(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "flex flex-col border-l-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
          TYPE_COLORS[test.type]?.border ?? "border-l-transparent",
          locked && "opacity-80",
        )}
        onClick={locked ? handleLockedClick : () => setOpen(true)}
        {...(locked
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": `${test.name} — 订阅解锁`,
              onKeyDown: handleLockedKeyDown,
            }
          : {
              role: "button",
              tabIndex: 0,
              "aria-label": test.name,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(true);
                }
              },
            })}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base leading-tight">{test.name}</CardTitle>
            {test.is_free ? (
              <Badge variant="secondary" className="ml-2 shrink-0">
                免费
              </Badge>
            ) : locked ? (
              <Badge variant="outline" className="ml-2 shrink-0 gap-1">
                <Lock className="h-3 w-3" />
                订阅解锁
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {test.question_count} 题
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {test.time_limit_minutes} 分钟
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{test.name}</DialogTitle>
            <DialogDescription>
              {test.question_count} 题 · {test.time_limit_minutes} 分钟
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground space-y-1">
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong>练习模式</strong>：无时间限制，每题作答后立即显示答案和解析</li>
              <li><strong>考试模式</strong>：计时进行，不显示答案；提交后显示成绩和预估等级</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={handleStart}
              disabled={starting || startingExam}
            >
              {starting ? "正在开始..." : "开始练习"}
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleStartExam}
              disabled={starting || startingExam}
            >
              {startingExam ? "正在开始..." : "开始考试"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

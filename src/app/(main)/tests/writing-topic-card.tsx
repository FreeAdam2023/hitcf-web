"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, Layers, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { TestSetItem } from "@/lib/api/types";

export function WritingTopicCard({ test }: { test: TestSetItem }) {
  const router = useRouter();
  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const locked = !test.is_free && !canAccessPaid;

  const numMatch = test.name.match(/(\d+)/);
  const num = numMatch ? numMatch[1] : "";

  return (
    <Card className={cn("group relative flex flex-col overflow-hidden card-interactive", locked && "opacity-75")}>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-violet-500/[0.02] to-transparent pointer-events-none" />

      <CardHeader className="relative pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <PenLine className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base leading-tight">
              Combinaison {num}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tâche 1 + 2 + 3
            </p>
          </div>
          {test.is_free ? (
            <Badge variant="secondary" className="shrink-0">
              免费
            </Badge>
          ) : locked ? (
            <Badge variant="outline" className="shrink-0 gap-1">
              <Lock className="h-3 w-3" />
              订阅
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {test.question_count} 个任务
          </span>
        </div>
        {locked ? (
          <Button size="sm" className="w-full" variant="outline" onClick={() => router.push("/pricing")}>
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            订阅解锁
          </Button>
        ) : (
          <Button asChild size="sm" className="w-full">
            <Link href={`/tests/${test.id}`}>查看题目</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

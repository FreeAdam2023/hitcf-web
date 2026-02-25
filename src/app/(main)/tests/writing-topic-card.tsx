"use client";

import Link from "next/link";
import { PenLine, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TestSetItem } from "@/lib/api/types";

export function WritingTopicCard({ test }: { test: TestSetItem }) {
  const numMatch = test.name.match(/(\d+)/);
  const num = numMatch ? numMatch[1] : "";

  return (
    <Card className="group relative flex flex-col overflow-hidden card-interactive">
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
          <div className="flex items-center gap-1.5">
            {test.is_free && (
              <Badge variant="secondary" className="shrink-0">
                免费
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {test.question_count} 个任务
          </span>
        </div>
        <Button asChild size="sm" className="w-full">
          <Link href={`/tests/${test.id}`}>查看题目</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

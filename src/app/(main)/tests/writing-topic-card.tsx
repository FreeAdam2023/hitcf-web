"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TestSetItem } from "@/lib/api/types";

export function WritingTopicCard({ test }: { test: TestSetItem }) {
  const numMatch = test.name.match(/(\d+)/);
  const num = numMatch ? numMatch[1] : "";

  return (
    <Card className="flex flex-col border-l-4 border-l-violet-500 card-interactive">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base leading-tight">
            Combinaison {num}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {test.is_free && (
              <Badge variant="secondary" className="shrink-0">
                免费
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <PenLine className="h-3.5 w-3.5" />
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

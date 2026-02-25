"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WritingTopicItem } from "@/lib/api/types";

const TACHE_LABELS: Record<number, string> = {
  1: "Tâche 1",
  2: "Tâche 2",
  3: "Tâche 3",
};

const WORD_LIMIT_LABELS: Record<string, string> = {
  "60-120": "60-120 mots",
  "120-160": "120-160 mots",
  "120-150": "120-150 mots",
  "200-300": "200-300 mots",
};

export function WritingLevelCard({
  topic,
  tache,
}: {
  topic: WritingTopicItem;
  tache: number;
}) {
  const preview =
    topic.question_text && topic.question_text.length > 120
      ? topic.question_text.slice(0, 120) + "..."
      : topic.question_text || "";

  return (
    <Card className="group relative flex flex-col overflow-hidden card-interactive">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-violet-500/[0.02] to-transparent pointer-events-none" />

      <CardHeader className="relative pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <PenLine className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-medium leading-tight text-muted-foreground">
              {TACHE_LABELS[tache] || `Tâche ${tache}`}
              {topic.word_limit && (
                <span className="ml-2 text-xs text-muted-foreground/70">
                  {WORD_LIMIT_LABELS[topic.word_limit] || topic.word_limit}
                </span>
              )}
            </CardTitle>
          </div>
          {topic.is_free && (
            <Badge variant="secondary" className="shrink-0">
              免费
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col justify-between gap-3">
        <p className="line-clamp-3 text-sm leading-relaxed">{preview}</p>
        <Button asChild size="sm" className="w-full">
          <Link href={`/tests/${topic.test_set_id}`}>
            <PenLine className="mr-1.5 h-3.5 w-3.5" />
            开始练习
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

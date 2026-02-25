"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TestSetItem } from "@/lib/api/types";

export function SpeakingTopicCard({ test }: { test: TestSetItem }) {
  // Extract partie number from name, e.g. "Expression Orale - Tâche 2 - Partie 1"
  const partieMatch = test.name.match(/Partie\s+(\d+)/);
  const partieNum = partieMatch ? partieMatch[1] : "";
  const isTache2 = test.code.includes("tache2");

  return (
    <Card className="flex flex-col border-l-4 border-l-amber-500 card-interactive">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base leading-tight">
            第 {partieNum} 套
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {test.is_free && (
              <Badge variant="secondary" className="shrink-0">
                免费
              </Badge>
            )}
            <Badge variant="outline" className="shrink-0">
              {isTache2 ? "对话" : "论述"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {test.question_count} 个话题
          </span>
        </div>
        <Button asChild size="sm" className="w-full">
          <Link href={`/tests/${test.id}`}>查看话题</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, FileText, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import type { TestSetItem } from "@/lib/api/types";

export function TestCard({ test }: { test: TestSetItem }) {
  const router = useRouter();
  const canAccessPaid = useAuthStore((s) => s.canAccessPaid);
  const locked = !test.is_free && !canAccessPaid();

  return (
    <Card
      className={`flex flex-col${locked ? " opacity-80" : ""}`}
      {...(locked ? { role: "button", onClick: () => router.push("/pricing") } : {})}
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
        {locked ? (
          <Button size="sm" variant="outline" className="w-full" onClick={() => router.push("/pricing")}>
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            订阅解锁
          </Button>
        ) : (
          <Button asChild size="sm" className="w-full">
            <Link href={`/tests/${test.id}`}>查看详情</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

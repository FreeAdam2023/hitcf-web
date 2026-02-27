"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, MessageCircle, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { TestSetItem } from "@/lib/api/types";

export function SpeakingTopicCard({ test }: { test: TestSetItem }) {
  const t = useTranslations();
  const router = useRouter();
  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const locked = !test.is_free && !canAccessPaid;

  const partieMatch = test.name.match(/Partie\s+(\d+)/);
  const partieNum = partieMatch ? partieMatch[1] : "";
  const isTache2 = test.code.includes("tache2");

  return (
    <Card className={cn("group relative flex flex-col overflow-hidden card-interactive", locked && "opacity-75")}>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] via-amber-500/[0.02] to-transparent pointer-events-none" />

      <CardHeader className="relative pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Mic className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base leading-tight">
              {t("tests.speakingSetNum", { num: partieNum })}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isTache2 ? t("tests.speakingTopicsTache2") : t("tests.speakingTopicsTache3")}
            </p>
          </div>
          {test.is_free ? (
            <Badge variant="secondary" className="shrink-0">
              {t("common.status.free")}
            </Badge>
          ) : locked ? (
            <Badge variant="outline" className="shrink-0 gap-1">
              <Lock className="h-3 w-3" />
              {t("common.status.subscription")}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            {t("tests.topicsCount", { count: test.question_count })}
          </span>
        </div>
        {locked ? (
          <Button size="sm" className="w-full" variant="outline" onClick={() => router.push("/pricing")}>
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            {t("testCard.subscribeUnlock")}
          </Button>
        ) : (
          <Button asChild size="sm" className="w-full">
            <Link href={`/tests/${test.id}`}>{t("tests.viewTopics")}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

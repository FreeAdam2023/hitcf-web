"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  RotateCcw,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ConversationChat } from "@/components/speaking/conversation-chat";
import { SpeakingEvaluationCard } from "@/components/speaking/speaking-evaluation-card";
import {
  getConversation,
  reEvaluateConversation,
} from "@/lib/api/speaking-conversation";
import type { SpeakingConversationResponse } from "@/lib/api/types";

export default function SpeakingConversationResultsPage() {
  const t = useTranslations("speakingConversation");
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<SpeakingConversationResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [reEvaluating, setReEvaluating] = useState(false);

  useEffect(() => {
    getConversation(params.sessionId)
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [params.sessionId]);

  const handleReEvaluate = async () => {
    setReEvaluating(true);
    try {
      const updated = await reEvaluateConversation(params.sessionId);
      setSession(updated);
      toast.success(t("evaluation"));
    } catch {
      toast.error(t("endFailed"));
    } finally {
      setReEvaluating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!session) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t("notFound")}
      </div>
    );
  }

  const tacheLabel = session.tache_type === 1 ? "Tâche 1" : session.tache_type === 3 ? "Tâche 3" : "Tâche 2";
  const durationMin = Math.floor(session.duration_seconds / 60);
  const durationSec = session.duration_seconds % 60;

  const handleRetry = () => {
    if (session.tache_type === 1) {
      router.push("/tests?tab=speaking");
      return;
    }
    router.push(
      `/speaking-conversation?testSetId=${session.test_set_id}&questionId=${session.question_id}`,
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Breadcrumb
        items={[
          { label: t("backToTests"), href: `/tests` },
          { label: `${t("results")} · ${tacheLabel}` },
        ]}
      />

      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <CardTitle className="text-xl">{t("results")}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{tacheLabel}</Badge>
                <Badge variant="secondary">
                  {session.turn_count} {t("turns")}
                </Badge>
                <Badge variant="secondary">
                  {durationMin}m {durationSec}s
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Evaluation */}
      {session.evaluation ? (
        <SpeakingEvaluationCard evaluation={session.evaluation} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <p className="font-medium">{t("evaluationUnavailable")}</p>
            <p className="text-sm text-muted-foreground">
              {t("evaluationUnavailableDesc")}
            </p>
            <Button
              onClick={handleReEvaluate}
              disabled={reEvaluating}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${reEvaluating ? "animate-spin" : ""}`}
              />
              {reEvaluating ? t("reEvaluating") : t("reEvaluate")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Conversation replay */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("conversationReplay")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <ConversationChat turns={session.turns} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/tests")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToTests")}
        </Button>
        <Button onClick={handleRetry}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import type { SceneBriefing } from "@/lib/api/types";

interface SceneBriefingCardProps {
  briefing: SceneBriefing;
}

export function SceneBriefingCard({ briefing }: SceneBriefingCardProps) {
  const t = useTranslations("speakingConversation");
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <CardContent className="pt-4">
        <button
          className="flex w-full items-center justify-between text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{t("sceneBriefing")}</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expanded && (
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t("scenario")}:</span>{" "}
              <span className="break-words leading-relaxed">{briefing.scenario}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("yourRole")}:</span>{" "}
              {briefing.your_role}
            </div>
            <div>
              <span className="text-muted-foreground">{t("examinerRole")}:</span>{" "}
              {briefing.examiner_role}
            </div>
            <div>
              <span className="text-muted-foreground">{t("targetDuration")}:</span>{" "}
              {briefing.target_duration}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationTurnResponse } from "@/lib/api/types";
import { useTranslations } from "next-intl";

interface ConversationChatProps {
  turns: ConversationTurnResponse[];
  isWaiting?: boolean;
}

export function ConversationChat({ turns, isWaiting }: ConversationChatProps) {
  const t = useTranslations("speakingConversation");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length, isWaiting]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {turns.map((turn, i) => {
        const isExaminer = turn.role === "examiner";
        return (
          <div
            key={i}
            className={cn(
              "flex gap-2.5",
              isExaminer ? "justify-start" : "justify-end",
            )}
          >
            {isExaminer && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <Bot className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] break-words rounded-2xl px-3.5 py-2.5 text-sm lg:text-base leading-relaxed sm:max-w-[80%]",
                isExaminer
                  ? "rounded-tl-sm bg-muted"
                  : "rounded-tr-sm bg-primary text-primary-foreground",
              )}
            >
              {turn.text}
            </div>
            {!isExaminer && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <User className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
              </div>
            )}
          </div>
        );
      })}
      {isWaiting && (
        <div className="flex gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <Bot className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
            {t("examinerThinking")}
            <span className="ml-1 inline-flex gap-0.5">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:0.1s]">.</span>
              <span className="animate-bounce [animation-delay:0.2s]">.</span>
            </span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

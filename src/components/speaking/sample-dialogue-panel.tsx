"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { BookOpen, ChevronDown, ChevronUp, Bot, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SampleDialoguePanelProps {
  tacheType: number;
  defaultCollapsed?: boolean;
}

interface SampleTurn {
  role: string;
  fr: string;
  zh: string;
  en: string;
}

// Generic sample dialogues per tâche type (locale-independent French + translations)
const SAMPLE_DIALOGUES: Record<number, SampleTurn[]> = {
  1: [
    { role: "examiner", fr: "Bonjour, comment vous appelez-vous ?", zh: "你好，你叫什么名字？", en: "Hello, what is your name?" },
    { role: "user", fr: "Bonjour, je m'appelle Marie. Je suis étudiante.", zh: "你好，我叫 Marie。我是一名学生。", en: "Hello, my name is Marie. I'm a student." },
    { role: "examiner", fr: "Qu'est-ce que vous étudiez ?", zh: "你在学什么？", en: "What are you studying?" },
    { role: "user", fr: "J'étudie l'informatique à l'université. C'est ma troisième année.", zh: "我在大学学计算机，这是我第三年了。", en: "I'm studying computer science at university. It's my third year." },
  ],
  2: [
    { role: "examiner", fr: "Bonjour, bienvenue. Comment puis-je vous aider ?", zh: "你好，欢迎。有什么可以帮您的？", en: "Hello, welcome. How can I help you?" },
    { role: "user", fr: "Bonjour, je voudrais m'inscrire au cours de français. Pouvez-vous me donner des informations ?", zh: "你好，我想报名法语课程。能给我一些信息吗？", en: "Hello, I'd like to register for the French course. Can you give me some information?" },
    { role: "examiner", fr: "Bien sûr. Le cours commence le 15 septembre et dure 6 semaines.", zh: "当然可以。课程9月15日开始，持续6周。", en: "Of course. The course starts September 15 and lasts 6 weeks." },
    { role: "user", fr: "D'accord. Quels sont les horaires et le coût ?", zh: "好的。上课时间和费用是多少？", en: "OK. What are the schedule and cost?" },
  ],
  3: [
    { role: "examiner", fr: "Aujourd'hui, nous allons discuter de l'impact des réseaux sociaux. Qu'en pensez-vous ?", zh: "今天我们来讨论社交媒体的影响。你怎么看？", en: "Today we'll discuss the impact of social media. What do you think?" },
    { role: "user", fr: "Je pense que les réseaux sociaux ont à la fois des avantages et des inconvénients. D'un côté, ils permettent de rester en contact avec sa famille.", zh: "我认为社交媒体既有优点也有缺点。一方面，它们让我们能和家人保持联系。", en: "I think social media has both advantages and disadvantages. On one hand, they allow us to stay in touch with family." },
    { role: "examiner", fr: "Pouvez-vous donner un exemple concret d'un inconvénient ?", zh: "你能举一个具体的缺点例子吗？", en: "Can you give a concrete example of a disadvantage?" },
    { role: "user", fr: "Par exemple, beaucoup de jeunes passent trop de temps sur leur téléphone, ce qui affecte leurs études.", zh: "比如很多年轻人花太多时间在手机上，影响了学业。", en: "For example, many young people spend too much time on their phones, which affects their studies." },
  ],
};

export function SampleDialoguePanel({ tacheType, defaultCollapsed = false }: SampleDialoguePanelProps) {
  const t = useTranslations("speakingConversation");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(!defaultCollapsed);

  const dialogue = SAMPLE_DIALOGUES[tacheType];
  if (!dialogue) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">{t("sampleDialogue.title")}</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-xs text-muted-foreground">{t("sampleDialogue.description")}</p>
            {dialogue.map((turn, i) => {
              const isExaminer = turn.role === "examiner";
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg p-2.5 text-sm",
                    isExaminer ? "bg-muted" : "border border-primary/20 bg-primary/5",
                  )}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    {isExaminer ? (
                      <Bot className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <User className="h-3 w-3 text-blue-600" />
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {isExaminer ? t("examinerRole").split("—")[0].trim() : t("yourRole").split("—")[0].trim()}
                    </span>
                  </div>
                  <p className="font-medium leading-relaxed">{turn.fr}</p>
                  {locale !== "fr" && (
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {locale === "en" ? turn.en : `${turn.zh}`}
                      {locale !== "en" && (
                        <span className="ml-1 text-blue-500 dark:text-blue-400">{turn.en}</span>
                      )}
                    </p>
                  )}
                  {!isExaminer && (
                    <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                      {t("sampleDialogue.tryReading")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

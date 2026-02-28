"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, BookOpen } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FrenchText } from "@/components/practice/french-text";
import { cn } from "@/lib/utils";

interface WritingGuidePanelProps {
  taskNumber: number; // 1, 2, or 3
}

// Static connectors per task level — French only, clickable via FrenchText
const CONNECTORS: Record<number, string[]> = {
  1: [
    "et", "mais", "aussi", "parce que", "donc", "alors",
    "d'abord", "ensuite", "enfin", "merci de", "cordialement",
  ],
  2: [
    "cependant", "en effet", "de plus", "par exemple",
    "à mon avis", "je considère que", "en conclusion",
    "d'une part", "d'autre part", "il me semble que",
  ],
  3: [
    "en revanche", "néanmoins", "par conséquent", "toutefois",
    "il est évident que", "force est de constater que",
    "en ce qui concerne", "selon", "d'après",
    "en somme", "pour conclure",
  ],
};

export function WritingGuidePanel({ taskNumber }: WritingGuidePanelProps) {
  const t = useTranslations("writingGuide");
  const [open, setOpen] = useState(false);

  const tn = Math.min(Math.max(taskNumber, 1), 3) as 1 | 2 | 3;
  const connectors = CONNECTORS[tn];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{t("title")}</span>
        <ChevronDown
          className={cn(
            "ml-auto h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-3 rounded-md bg-muted/30 p-3 text-xs">
        {/* Format */}
        <div>
          <p className="mb-1 font-semibold text-foreground">{t("format")}</p>
          <p className="text-muted-foreground">{t(`task${tn}.format`)}</p>
        </div>

        {/* Register */}
        <div>
          <p className="mb-1 font-semibold text-foreground">{t("register")}</p>
          <p className="text-muted-foreground">{t(`task${tn}.register`)}</p>
        </div>

        {/* Structure */}
        <div>
          <p className="mb-1 font-semibold text-foreground">{t("structure")}</p>
          <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
            {(t.raw(`task${tn}.steps`) as string[]).map((step: string, i: number) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>

        {/* Connectors */}
        <div>
          <p className="mb-1.5 font-semibold text-foreground">{t("connectors")}</p>
          <div className="flex flex-wrap gap-1.5">
            {connectors.map((c) => (
              <span
                key={c}
                className="inline-block rounded-md bg-background px-2 py-0.5 text-xs"
              >
                <FrenchText text={c} />
              </span>
            ))}
          </div>
        </div>

        {/* Word count */}
        <div>
          <p className="mb-1 font-semibold text-foreground">{t("wordTarget")}</p>
          <p className="text-muted-foreground">{t(`task${tn}.words`)}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

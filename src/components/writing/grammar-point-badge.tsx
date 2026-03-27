"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { matchGrammarCard } from "@/lib/api/questions";
import type { GrammarCard } from "@/lib/api/types";
import { getReferenceSluForGrammarPoint } from "@/lib/grammar-reference-map";

/** Inline expandable grammar card badge — shown next to writing corrections */
export function GrammarPointBadge({ slug }: { slug: string }) {
  const t = useTranslations("grammarCheatSheet");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [card, setCard] = useState<GrammarCard | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (card !== undefined) return;
    setLoading(true);
    try {
      const result = await matchGrammarCard(slug);
      setCard(result);
    } catch { setCard(null); }
    finally { setLoading(false); }
  }, [expanded, card, slug]);

  return (
    <div className="mt-1">
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1 rounded-md border bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary transition-colors hover:bg-primary/10"
      >
        <BookOpen className="h-3 w-3" />
        {slug}
        {expanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
      </button>
      {expanded && (
        <div className="mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {loading && (
            <div className="flex items-center gap-1.5 py-1 text-[10px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          )}
          {card === null && !loading && (
            <p className="py-1 text-[10px] text-muted-foreground">{t("noResults")}</p>
          )}
          {card && (() => {
            const refSlug = getReferenceSluForGrammarPoint(slug);
            return (
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{card.name}</span>
                  {card.name_zh && <span className="text-muted-foreground">{card.name_zh}</span>}
                  <Badge variant="secondary" className="ml-auto text-[10px]">{card.level}</Badge>
                </div>
                {card.rule && <p className="mt-1 font-mono text-primary/80">{card.rule}</p>}
                {card.rule_zh && locale !== "en" && <p className="text-muted-foreground">{card.rule_zh}</p>}
                <p className="mt-1 leading-relaxed">{locale === "en" ? card.explanation_en : card.explanation}</p>
                {card.examples.length > 0 && (
                  <div className="mt-1.5 space-y-1 border-t border-border/50 pt-1.5">
                    {card.examples.map((ex, i) => (
                      <div key={i}>
                        <p className="font-medium">{ex.fr}</p>
                        <p className="text-muted-foreground">{locale === "en" ? ex.en : `${ex.zh} / ${ex.en}`}</p>
                      </div>
                    ))}
                  </div>
                )}
                {refSlug && (
                  <Link
                    href={`/reference/${refSlug}`}
                    className="mt-2 inline-flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] font-medium text-primary hover:underline"
                  >
                    {t("viewCard")}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

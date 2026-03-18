"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertTextAtCursor } from "@/lib/textarea-utils";
import { getWritingHints } from "@/lib/api/writing";
import { getGrammarCards } from "@/lib/api/questions";
import type { WritingHintCard, GrammarCard } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────

export type SidebarTab = "expressions" | "hints" | "grammar";

interface WritingSidebarProps {
  taskNumber: number;
  questionId: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  defaultTab?: SidebarTab;
}

// ── Expressions static data ────────────────────────────────────────

interface ExpressionItem {
  fr: string;
  note: string;
}

const EXPRESSIONS: Record<number, Record<string, ExpressionItem[]>> = {
  1: {
    greeting: [
      { fr: "Cher/Chère ...,", note: "greeting.dear" },
      { fr: "Bonjour ...,", note: "greeting.hello" },
      { fr: "Madame, Monsieur,", note: "greeting.formal" },
    ],
    opening: [
      { fr: "Je vous écris pour ", note: "opening.writeTo" },
      { fr: "Je me permets de vous contacter pour ", note: "opening.contactFor" },
      { fr: "Suite à votre annonce, ", note: "opening.followingAd" },
      { fr: "Je souhaiterais ", note: "opening.wouldLike" },
    ],
    connector: [
      { fr: "De plus, ", note: "connector.moreover" },
      { fr: "En effet, ", note: "connector.indeed" },
      { fr: "Par ailleurs, ", note: "connector.furthermore" },
      { fr: "C'est pourquoi ", note: "connector.thatIsWhy" },
    ],
    closing: [
      { fr: "Je vous remercie d'avance.", note: "closing.thankYou" },
      { fr: "Dans l'attente de votre réponse, ", note: "closing.awaitReply" },
      { fr: "Cordialement,", note: "closing.regards" },
      { fr: "Amicalement,", note: "closing.friendly" },
      { fr: "À bientôt,", note: "closing.seeYou" },
    ],
  },
  2: {
    opening: [
      { fr: "J'aimerais vous parler de ", note: "opening.talkAbout" },
      { fr: "Il y a quelques jours, ", note: "opening.fewDaysAgo" },
      { fr: "Récemment, j'ai eu l'occasion de ", note: "opening.recently" },
      { fr: "C'est un sujet qui me tient à cœur.", note: "opening.heartfelt" },
    ],
    opinion: [
      { fr: "À mon avis, ", note: "opinion.inMyOpinion" },
      { fr: "Je considère que ", note: "opinion.iConsider" },
      { fr: "Il me semble que ", note: "opinion.itSeemsToMe" },
      { fr: "Je suis convaincu(e) que ", note: "opinion.convinced" },
      { fr: "Personnellement, je pense que ", note: "opinion.personally" },
    ],
    connector: [
      { fr: "Cependant, ", note: "connector.however" },
      { fr: "En revanche, ", note: "connector.onTheOtherHand" },
      { fr: "D'une part... d'autre part, ", note: "connector.onOneHand" },
      { fr: "En effet, ", note: "connector.indeed" },
      { fr: "Par exemple, ", note: "connector.forExample" },
      { fr: "Malgré cela, ", note: "connector.despite" },
    ],
    closing: [
      { fr: "En conclusion, ", note: "closing.inConclusion" },
      { fr: "Pour toutes ces raisons, ", note: "closing.forAllReasons" },
      { fr: "En fin de compte, ", note: "closing.ultimately" },
    ],
  },
  3: {
    opening: [
      { fr: "Les deux documents présentent des points de vue opposés sur ", note: "opening.opposingViews" },
      { fr: "D'après le premier document, ", note: "opening.firstDoc" },
      { fr: "Le second document affirme que ", note: "opening.secondDoc" },
      { fr: "Selon l'auteur, ", note: "opening.accordingTo" },
    ],
    connector: [
      { fr: "Néanmoins, ", note: "connector.nevertheless" },
      { fr: "Toutefois, ", note: "connector.nonetheless" },
      { fr: "Par conséquent, ", note: "connector.consequently" },
      { fr: "En ce qui concerne ", note: "connector.regarding" },
      { fr: "Force est de constater que ", note: "connector.mustNote" },
      { fr: "Il est indéniable que ", note: "connector.undeniable" },
    ],
    opinion: [
      { fr: "Quant à moi, je soutiens que ", note: "opinion.iMaintain" },
      { fr: "Il est évident que ", note: "opinion.obvious" },
      { fr: "On ne peut nier que ", note: "opinion.cannotDeny" },
      { fr: "Il convient de souligner que ", note: "opinion.worthNoting" },
    ],
    closing: [
      { fr: "En somme, ", note: "closing.inSummary" },
      { fr: "Pour conclure, ", note: "closing.toSum" },
      { fr: "Tout compte fait, ", note: "closing.allConsidered" },
    ],
  },
};

const CATEGORY_ORDER: Record<number, string[]> = {
  1: ["greeting", "opening", "connector", "closing"],
  2: ["opening", "opinion", "connector", "closing"],
  3: ["opening", "connector", "opinion", "closing"],
};

// ── Hints helpers ──────────────────────────────────────────────────

const ANGLE_COLORS: Record<string, string> = {
  location: "border-l-blue-500",
  price: "border-l-green-500",
  service: "border-l-purple-500",
  quality: "border-l-amber-500",
  experience: "border-l-pink-500",
  comparison: "border-l-cyan-500",
  advantage: "border-l-emerald-500",
  disadvantage: "border-l-red-500",
};

function getAngleColor(angle: string): string {
  const lower = angle.toLowerCase();
  for (const [key, cls] of Object.entries(ANGLE_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  const colors = [
    "border-l-blue-500",
    "border-l-green-500",
    "border-l-purple-500",
    "border-l-amber-500",
    "border-l-pink-500",
    "border-l-cyan-500",
    "border-l-emerald-500",
    "border-l-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < angle.length; i++) {
    hash = (hash * 31 + angle.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

// ── Grammar helpers ────────────────────────────────────────────────

const GRAMMAR_CATEGORY_ORDER = ["tense", "mood", "pronoun", "structure", "other"];
const GRAMMAR_CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  tense: { zh: "时态", en: "Tenses" },
  mood: { zh: "语气", en: "Moods" },
  pronoun: { zh: "代词", en: "Pronouns" },
  structure: { zh: "句型结构", en: "Structures" },
  other: { zh: "其他", en: "Other" },
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  A2: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  B1: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  B2: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  C1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  C2: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

// ── Module-level caches ────────────────────────────────────────────

const _hintsCache = new Map<string, WritingHintCard[]>();
let _grammarCache: GrammarCard[] | null = null;

// ── Component ──────────────────────────────────────────────────────

export function WritingSidebar({
  taskNumber,
  questionId,
  textareaRef,
  defaultTab = "expressions",
}: WritingSidebarProps) {
  const tExpr = useTranslations("expressionsDrawer");
  const tHints = useTranslations("writingHints");
  const tGrammar = useTranslations("grammarCheatSheet");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<SidebarTab>(defaultTab);

  // ── Hints state ──
  const [hintCards, setHintCards] = useState<WritingHintCard[]>(
    () => _hintsCache.get(questionId) ?? [],
  );
  const [hintsLoading, setHintsLoading] = useState(false);
  const [hintsError, setHintsError] = useState(false);
  const hintsFetchedRef = useRef<Set<string>>(new Set());

  // ── Grammar state ──
  const [grammarCards, setGrammarCards] = useState<GrammarCard[]>(_grammarCache ?? []);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarSearch, setGrammarSearch] = useState("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  // Sync defaultTab when it changes from parent
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // ── Fetch hints ──
  const fetchHints = useCallback(async () => {
    setHintsLoading(true);
    setHintsError(false);
    try {
      const result = await getWritingHints(questionId);
      setHintCards(result.cards);
      _hintsCache.set(questionId, result.cards);
      hintsFetchedRef.current.add(questionId);
    } catch {
      setHintsError(true);
    } finally {
      setHintsLoading(false);
    }
  }, [questionId]);

  // ── Fetch grammar ──
  const fetchGrammar = useCallback(async () => {
    if (_grammarCache) {
      setGrammarCards(_grammarCache);
      return;
    }
    setGrammarLoading(true);
    try {
      const result = await getGrammarCards();
      _grammarCache = result;
      setGrammarCards(result);
    } catch {
      // silent
    } finally {
      setGrammarLoading(false);
    }
  }, []);

  // Lazy-load data when tab is first opened
  useEffect(() => {
    if (activeTab === "hints") {
      if (
        !hintsFetchedRef.current.has(questionId) &&
        !_hintsCache.has(questionId) &&
        !hintsLoading
      ) {
        fetchHints();
      } else if (_hintsCache.has(questionId)) {
        setHintCards(_hintsCache.get(questionId)!);
      }
    } else if (activeTab === "grammar") {
      if (grammarCards.length === 0 && !grammarLoading) {
        fetchGrammar();
      }
    }
  }, [activeTab, questionId, hintsLoading, grammarCards.length, grammarLoading, fetchHints, fetchGrammar]);

  // ── Insert handler ──
  const handleInsert = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      requestAnimationFrame(() => {
        insertTextAtCursor(textarea, text);
      });
    },
    [textareaRef],
  );

  // ── Expressions data ──
  const tn = Math.min(Math.max(taskNumber, 1), 3) as 1 | 2 | 3;
  const exprCategories = CATEGORY_ORDER[tn];
  const exprData = EXPRESSIONS[tn];
  const defaultExprTab = exprCategories[0];

  // ── Grammar filtering ──
  const filteredGrammar = grammarSearch.trim()
    ? grammarCards.filter((c) => {
        const q = grammarSearch.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.name_zh?.toLowerCase().includes(q) ||
          c.name_en?.toLowerCase().includes(q) ||
          c.slug.includes(q) ||
          c.tags?.some((tag) => tag.toLowerCase().includes(q))
        );
      })
    : grammarCards;

  const groupedGrammar = GRAMMAR_CATEGORY_ORDER.reduce<Record<string, GrammarCard[]>>(
    (acc, cat) => {
      const items = filteredGrammar.filter((c) => c.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {},
  );

  return (
    <div className="w-[300px] shrink-0 border-l bg-background flex flex-col h-full">
      {/* Header with tabs and close button */}
      <div className="flex items-center gap-1.5 border-b px-3 py-2">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as SidebarTab)}
          className="flex-1 min-w-0"
        >
          <TabsList className="h-8 w-full">
            <TabsTrigger value="expressions" className="flex-1 text-xs px-1.5">
              {tExpr("trigger")}
            </TabsTrigger>
            <TabsTrigger value="hints" className="flex-1 text-xs px-1.5">
              {tHints("trigger")}
            </TabsTrigger>
            <TabsTrigger value="grammar" className="flex-1 text-xs px-1.5">
              {tGrammar("trigger")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* ── Expressions tab ── */}
        {activeTab === "expressions" && (
          <div>
            <p className="mb-2 text-xs text-muted-foreground">{tExpr("subtitle")}</p>
            <Tabs defaultValue={defaultExprTab}>
              <TabsList className="w-full">
                {exprCategories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="flex-1 text-xs">
                    {tExpr(`categories.${cat}`)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {exprCategories.map((cat) => (
                <TabsContent key={cat} value={cat} className="mt-3 space-y-1.5">
                  {exprData[cat]?.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleInsert(item.fr)}
                      className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted/70 active:bg-muted"
                    >
                      <span className="flex-1">
                        <span className="font-medium text-foreground">{item.fr}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {tExpr(`notes.${item.note}`)}
                        </span>
                      </span>
                    </button>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* ── Hints tab ── */}
        {activeTab === "hints" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{tHints("subtitle")}</p>

            {hintsLoading && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2 rounded-lg border-l-4 border-l-muted p-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-1.5">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                  </div>
                ))}
                <p className="text-center text-xs text-muted-foreground">{tHints("loading")}</p>
              </>
            )}

            {hintsError && !hintsLoading && (
              <div className="flex flex-col items-center gap-2 py-8">
                <p className="text-sm text-muted-foreground">{tHints("error")}</p>
                <Button variant="outline" size="sm" onClick={fetchHints}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  {tHints("retry")}
                </Button>
              </div>
            )}

            {!hintsLoading &&
              !hintsError &&
              hintCards.map((card, i) => (
                <div
                  key={i}
                  className={`space-y-1.5 rounded-lg border-l-4 bg-muted/30 p-3 ${getAngleColor(card.angle)}`}
                >
                  <div>
                    <p className="text-sm font-medium">{card.title_fr}</p>
                    <p className="text-xs text-muted-foreground">{card.title_native}</p>
                  </div>
                  {card.brief && (
                    <p className="text-xs text-muted-foreground">{card.brief}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {card.key_phrases.map((phrase, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => handleInsert(phrase)}
                        className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
                        title={phrase}
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── Grammar tab ── */}
        {activeTab === "grammar" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{tGrammar("subtitle")}</p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={tGrammar("searchPlaceholder")}
                value={grammarSearch}
                onChange={(e) => setGrammarSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {grammarLoading && (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            )}

            {!grammarLoading && Object.keys(groupedGrammar).length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                {grammarSearch ? tGrammar("noResults") : tGrammar("empty")}
              </p>
            )}

            {!grammarLoading &&
              Object.entries(groupedGrammar).map(([cat, items]) => (
                <div key={cat}>
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {locale === "en"
                      ? GRAMMAR_CATEGORY_LABELS[cat]?.en
                      : GRAMMAR_CATEGORY_LABELS[cat]?.zh}{" "}
                    <span className="font-normal">({items.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {items.map((card) => (
                      <GrammarCardRow
                        key={card.slug}
                        card={card}
                        locale={locale}
                        expanded={expandedSlug === card.slug}
                        onToggle={() =>
                          setExpandedSlug(
                            expandedSlug === card.slug ? null : card.slug,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Grammar card row (adapted from grammar-cheat-sheet.tsx) ────────

function GrammarCardRow({
  card,
  locale,
  expanded,
  onToggle,
}: {
  card: GrammarCard;
  locale: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
      >
        <span className="flex-1 font-medium">
          {card.name}
          {card.name_zh && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {card.name_zh}
            </span>
          )}
        </span>
        <Badge
          variant="secondary"
          className={cn("text-[10px] px-1.5 py-0", LEVEL_COLORS[card.level] ?? "")}
        >
          {card.level}
        </Badge>
        {expanded ? (
          <ChevronUp className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 border-t px-3 py-2 text-xs space-y-1.5">
          {card.rule && (
            <p className="font-mono text-primary/80">{card.rule}</p>
          )}
          {card.rule_zh && locale !== "en" && (
            <p className="text-muted-foreground">{card.rule_zh}</p>
          )}
          <p className="leading-relaxed">
            {locale === "en" ? card.explanation_en : card.explanation}
          </p>
          {card.examples.length > 0 && (
            <div className="space-y-1 border-t border-border/50 pt-1.5">
              {card.examples.map((ex, i) => (
                <div key={i}>
                  <p className="font-medium text-foreground">{ex.fr}</p>
                  <p className="text-muted-foreground">
                    {locale === "en" ? ex.en : `${ex.zh} / ${ex.en}`}
                  </p>
                </div>
              ))}
            </div>
          )}
          {card.irregulars && (
            <p className="border-t border-border/50 pt-1.5 text-muted-foreground">
              {card.irregulars}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

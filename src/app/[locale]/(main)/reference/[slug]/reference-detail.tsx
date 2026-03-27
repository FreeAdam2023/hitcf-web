"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  List,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getReferenceBySlug, listReferences } from "@/lib/api/reference";
import type {
  GrammarReferenceDetail as RefDetail,
  GrammarReferenceItem,
} from "@/lib/api/types";
import { MarkdownRenderer } from "@/components/reference/markdown-renderer";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  A2: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  B2: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  C1: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  C2: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
};

function extractHeadings(md: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  for (const line of md.split("\n")) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
      headings.push({ id, text, level: match[1].length });
    }
  }
  return headings;
}

export function ReferenceDetail() {
  const t = useTranslations("reference");
  const locale = useLocale();
  const params = useParams<{ slug: string }>()!;
  const [topic, setTopic] = useState<RefDetail | null>(null);
  const [allItems, setAllItems] = useState<GrammarReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getReferenceBySlug(params.slug, locale),
      listReferences(locale),
    ])
      .then(([detail, items]) => {
        setTopic(detail);
        setAllItems(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug, locale]);

  const headings = useMemo(
    () => (topic?.content ? extractHeadings(topic.content) : []),
    [topic?.content],
  );

  const { prev, next } = useMemo(() => {
    if (!allItems.length || !topic)
      return { prev: null, next: null };
    const idx = allItems.findIndex((i) => i.slug === topic.slug);
    return {
      prev: idx > 0 ? allItems[idx - 1] : null,
      next: idx < allItems.length - 1 ? allItems[idx + 1] : null,
    };
  }, [allItems, topic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Topic not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/reference">{t("backToReference")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/reference"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToReference")}
      </Link>

      {/* Header */}
      <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-violet-500/5 dark:from-primary/10 dark:to-violet-500/10 p-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">{topic.title}</h1>
          {topic.level && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-2.5 py-0.5 font-bold",
                LEVEL_COLOR[topic.level] ?? "",
              )}
            >
              {topic.level}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {topic.description}
        </p>
      </div>

      {/* Table of Contents */}
      {headings.length > 2 && (
        <nav className="mb-8 rounded-xl border bg-muted/20 dark:bg-muted/10 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <List className="h-3.5 w-3.5" />
            {t("toc")}
          </div>
          <ul className="space-y-1">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={cn(
                    "text-sm text-muted-foreground hover:text-foreground transition-colors block py-0.5",
                    h.level === 3 && "ml-4",
                  )}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Content */}
      <MarkdownRenderer content={topic.content} />

      {/* Prev / Next navigation */}
      <div className="mt-12 pt-6 border-t flex items-center justify-between gap-4">
        {prev ? (
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={`/reference/${prev.slug}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{prev.title}</span>
              <span className="sm:hidden">{t("prevTopic")}</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {next ? (
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={`/reference/${next.slug}`}>
              <span className="hidden sm:inline">{next.title}</span>
              <span className="sm:hidden">{t("nextTopic")}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

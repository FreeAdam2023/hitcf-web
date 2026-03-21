"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  ChevronRight,
  GraduationCap,
  Star,
  Lock,
  Loader2,
  Tags,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  PenLine,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { getSavedWordStats, listSavedWords, getNihaoStats, getThemeStats } from "@/lib/api/vocabulary";
import type { SavedWordStats, SavedWordItem, NihaoStats, ThemeStats } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const SOURCE_ICON: Record<string, typeof Headphones> = {
  listening: Headphones,
  reading: FileText,
  speaking: Mic,
  writing: PenLine,
};

const SOURCE_COLOR: Record<string, string> = {
  listening: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  reading: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  speaking: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  writing: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
};

const LEVEL_COLOR: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  A2: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  B2: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  C1: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  C2: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
};

export function VocabularyView() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [stats, setStats] = useState<SavedWordStats | null>(null);
  const [nihaoStats, setNihaoStats] = useState<NihaoStats | null>(null);
  const [themeStats, setThemeStats] = useState<ThemeStats | null>(null);
  const [recent, setRecent] = useState<SavedWordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const promises: Promise<void>[] = [
      getNihaoStats().then((s) => setNihaoStats(s)).catch(() => {}),
      getThemeStats().then((s) => setThemeStats(s)).catch(() => {}),
    ];
    if (isLoggedIn) {
      promises.push(
        getSavedWordStats().then((s) => setStats(s)).catch(() => {}),
        listSavedWords({ page: 1, page_size: 5 }).then((r) => setRecent(r.items)).catch(() => {}),
      );
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [isLoggedIn]);

  const nonZeroTypes = stats
    ? (["listening", "reading", "speaking", "writing"] as const).filter(
        (type) => (stats.by_source_type[type] || 0) > 0,
      )
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("vocabulary.title")}
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("vocabulary.subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats overview — only for logged-in users with words */}
          {isLoggedIn && stats && stats.total > 0 && (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-3 pt-5 pb-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">{t("vocabulary.stats.total")}</p>
                  </div>
                </CardContent>
              </Card>
              {nonZeroTypes.slice(0, 3).map((type) => {
                const Icon = SOURCE_ICON[type];
                return (
                  <Card key={type}>
                    <CardContent className="flex items-center gap-3 pt-5 pb-4">
                      <div className={cn("rounded-lg p-2", SOURCE_COLOR[type])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold tabular-nums">{stats.by_source_type[type]}</p>
                        <p className="text-xs text-muted-foreground">{t(`common.types.${type}`)}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Recent saved words */}
          {isLoggedIn && recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{t("vocabulary.recentSaved")}</h2>
                <Link href="/vocabulary/my-saved" className="text-sm text-primary hover:underline flex items-center gap-0.5">
                  {t("vocabulary.viewAll")} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <Card>
                <CardContent className="p-0 divide-y">
                  {recent.map((item) => {
                    const levelClass = item.cefr_level ? LEVEL_COLOR[item.cefr_level] || "bg-muted" : "";
                    return (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors">
                        <div className="min-w-0">
                          <span className="font-medium">{item.display_form || item.word}</span>
                          {item.ipa && (
                            <span className="ml-2 text-xs text-muted-foreground font-mono">[{item.ipa}]</span>
                          )}
                          {item.meaning_zh && (
                            <span className="ml-2 text-sm text-muted-foreground">{item.meaning_zh}</span>
                          )}
                        </div>
                        {item.cefr_level && (
                          <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold", levelClass)}>
                            {item.cefr_level}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pool entry cards */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">{t("vocabulary.pools.heading")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* My Saved */}
              {isLoggedIn ? (
                <Link href="/vocabulary/my-saved" className="group block">
                  <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                    <CardContent className="flex items-center gap-4 pt-6">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{t("vocabulary.pools.mySaved")}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {stats && stats.total > 0
                            ? t("vocabulary.pools.savedCount", { count: stats.total })
                            : t("vocabulary.pools.savedEmpty")}
                        </p>
                      </div>
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-60">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Star className="h-5 w-5" />
                      <Lock className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("vocabulary.pools.mySaved")}</h3>
                      <p className="text-sm text-muted-foreground">{t("vocabulary.loginToSave")}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nihao French */}
              <Link href="/vocabulary/nihao-french" className="group block">
                <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{t("vocabulary.nihaoFrench.poolTitle")}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {nihaoStats ? t("vocabulary.nihaoFrench.poolDesc", { count: nihaoStats.total }) : ""}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>

              {/* Theme Words */}
              <Link href="/vocabulary/theme-words" className="group block">
                <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                      <Tags className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{t("vocabulary.themeWords.title")}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {themeStats ? t("vocabulary.themeWords.totalWords", { count: themeStats.total }) : t("vocabulary.themeWords.heroDesc")}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

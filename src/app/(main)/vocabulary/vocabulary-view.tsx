"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap, Star, Lock, Loader2, Tags } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { getSavedWordStats, listSavedWords, getNihaoStats, getThemeStats } from "@/lib/api/vocabulary";
import type { SavedWordStats, SavedWordItem, NihaoStats, ThemeStats } from "@/lib/api/types";

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

  // Only show non-zero type stats
  const nonZeroTypes = stats
    ? (["listening", "reading", "speaking", "writing"] as const).filter(
        (type) => (stats.by_source_type[type] || 0) > 0,
      )
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Hero — clean, no pool-specific badges */}
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
          {/* Recent saved words — top priority for logged-in users */}
          {isLoggedIn && recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{t("vocabulary.recentSaved")}</h2>
                <Link href="/vocabulary/my-saved" className="text-sm text-primary hover:underline flex items-center gap-0.5">
                  {t("vocabulary.viewAll")} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {recent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div>
                      <span className="font-medium">{item.display_form || item.word}</span>
                      {item.ipa && (
                        <span className="ml-2 text-xs text-muted-foreground font-mono">{item.ipa}</span>
                      )}
                      {item.meaning_zh && (
                        <span className="ml-2 text-sm text-muted-foreground">{item.meaning_zh}</span>
                      )}
                    </div>
                    {item.cefr_level && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                        {item.cefr_level}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* Compact inline stats — only non-zero */}
              {stats && stats.total > 0 && nonZeroTypes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {t("vocabulary.stats.total")} {stats.total}
                  </span>
                  {nonZeroTypes.map((type) => (
                    <span key={type} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {t(`common.types.${type}`)} {stats.by_source_type[type]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pool entry cards */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">{t("vocabulary.pools.heading")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* My Saved */}
              {isLoggedIn ? (
                <Link
                  href="/vocabulary/my-saved"
                  className="group flex items-center gap-4 rounded-lg border p-5 transition-colors hover:bg-accent"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Star className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold group-hover:text-primary">{t("vocabulary.pools.mySaved")}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {stats && stats.total > 0
                        ? t("vocabulary.pools.savedCount", { count: stats.total })
                        : t("vocabulary.pools.savedEmpty")}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-4 rounded-lg border p-5 opacity-50">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Star className="h-5 w-5" />
                    <Lock className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("vocabulary.pools.mySaved")}</h3>
                    <p className="text-sm text-muted-foreground">{t("vocabulary.loginToSave")}</p>
                  </div>
                </div>
              )}

              {/* Nihao French */}
              <Link
                href="/vocabulary/nihao-french"
                className="group flex items-center gap-4 rounded-lg border p-5 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold group-hover:text-primary">{t("vocabulary.nihaoFrench.poolTitle")}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {nihaoStats ? t("vocabulary.nihaoFrench.poolDesc", { count: nihaoStats.total }) : ""}
                  </p>
                </div>
              </Link>

              {/* Theme Words */}
              <Link
                href="/vocabulary/theme-words"
                className="group flex items-center gap-4 rounded-lg border p-5 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                  <Tags className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold group-hover:text-primary">{t("vocabulary.themeWords.title")}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {themeStats ? t("vocabulary.themeWords.totalWords", { count: themeStats.total }) : t("vocabulary.themeWords.heroDesc")}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

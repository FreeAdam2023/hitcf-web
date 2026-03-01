"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Star, Lock, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { getSavedWordStats, listSavedWords, getNihaoStats } from "@/lib/api/vocabulary";
import type { SavedWordStats, SavedWordItem, NihaoStats } from "@/lib/api/types";

export function VocabularyView() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [stats, setStats] = useState<SavedWordStats | null>(null);
  const [nihaoStats, setNihaoStats] = useState<NihaoStats | null>(null);
  const [recent, setRecent] = useState<SavedWordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const promises: Promise<void>[] = [
      getNihaoStats().then((s) => setNihaoStats(s)).catch(() => {}),
    ];
    if (isLoggedIn) {
      promises.push(
        getSavedWordStats().then((s) => setStats(s)).catch(() => {}),
        listSavedWords({ page: 1, page_size: 5 }).then((r) => setRecent(r.items)).catch(() => {}),
      );
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [isLoggedIn]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("vocabulary.title")}
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("vocabulary.subtitle")}</p>
        {nihaoStats && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
              {t("vocabulary.nihaoFrench.poolDesc", { count: nihaoStats.total })}
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t("vocabulary.nihaoFrench.title")} A1
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats cards — logged in only */}
          {isLoggedIn && stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t("vocabulary.stats.total")}</p>
              </div>
              {(["listening", "reading", "speaking", "writing"] as const).map((type) => {
                const count = stats.by_source_type[type] || 0;
                if (count === 0 && stats.total === 0) return null;
                return (
                  <div key={type} className="rounded-lg border p-4 text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{t(`common.types.${type}`)}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pool entry cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* My Saved — clickable when logged in, greyed out otherwise */}
            {isLoggedIn ? (
              <Link
                href="/vocabulary/my-saved"
                className="group flex items-center gap-4 rounded-lg border p-5 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary">{t("vocabulary.pools.mySaved")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats ? t("vocabulary.pools.savedCount", { count: stats.total }) : ""}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4 rounded-lg border p-5 opacity-50">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Star className="h-5 w-5" />
                  <Lock className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{t("vocabulary.pools.mySaved")}</h3>
                  <p className="text-sm text-muted-foreground">{t("vocabulary.loginToSave")}</p>
                </div>
              </div>
            )}

            {/* Nihao French — always clickable */}
            <Link
              href="/vocabulary/nihao-french"
              className="group flex items-center gap-4 rounded-lg border p-5 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary">{t("vocabulary.nihaoFrench.poolTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                  {nihaoStats ? t("vocabulary.nihaoFrench.poolDesc", { count: nihaoStats.total }) : ""}
                </p>
              </div>
            </Link>

            {/* TCF Corpus — coming soon */}
            <div className="flex items-center gap-4 rounded-lg border border-dashed p-5 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{t("vocabulary.pools.tcfCorpus")}</h3>
                <p className="text-sm text-muted-foreground">{t("vocabulary.pools.comingSoon")}</p>
              </div>
            </div>
          </div>

          {/* Recent saved words — logged in only */}
          {isLoggedIn && recent.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">{t("vocabulary.recentSaved")}</h2>
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
              <Link href="/vocabulary/my-saved" className="mt-2 inline-block text-sm text-primary hover:underline">
                {t("vocabulary.viewAll")}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

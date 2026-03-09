"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { getMyReferralCode, getReferralStats, getMyReferrals } from "@/lib/api/referrals";
import type { ReferralStats, ReferralItem } from "@/lib/api/referrals";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Check,
  Gift,
  Users,
  Calendar,
  Share2,
  Clock,
  UserPlus,
  CreditCard,
  Sparkles,
  ArrowRight,
  LogIn,
} from "lucide-react";
import Link from "next/link";

const MAX_REFERRALS = 5;

export function ReferralView() {
  const t = useTranslations("referralPage");
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await getMyReferralCode();
      const [statsData, referralsData] = await Promise.all([
        getReferralStats(),
        getMyReferrals(),
      ]);
      setStats(statsData);
      setReferrals(referralsData.items);
    } catch {
      // Not logged in or error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchData]);

  const referralLink = stats?.referral_code
    ? `${typeof window !== "undefined" ? window.location.origin : "https://www.hitcf.com"}/en/register?ref=${stats.referral_code}`
    : "";

  const copyCode = useCallback(async () => {
    if (!stats?.referral_code) return;
    await navigator.clipboard.writeText(stats.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [stats]);

  const copyLink = useCallback(async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [referralLink]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-10 w-72" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>
        <Skeleton className="mx-auto h-48 w-full max-w-md" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // Unauthenticated — beautiful CTA
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-violet-500/5 to-indigo-400/5 p-12 text-center">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/25">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t("subtitle")}</p>
            <Link href="/login">
              <Button size="lg" className="mt-8 bg-gradient-to-r from-primary to-violet-500 px-8 hover:from-primary/90 hover:to-violet-500/90">
                <LogIn className="mr-2 h-4 w-4" />
                {t("loginButton")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = stats?.total_referrals ?? 0;
  const progressPercent = Math.min((completedCount / MAX_REFERRALS) * 100, 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="animate-fade-in-up mb-12 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/25">
          <Gift className="h-7 w-7 text-white" />
        </div>
        <h1 className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          {t("subtitle")}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {t("heroTagline")}
        </div>
      </div>

      {/* How It Works — 3-step flow */}
      <div className="animate-fade-in-up-d1 mb-12">
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t("howItWorks")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Share2, title: t("step1Title"), desc: t("step1"), color: "from-blue-500 to-cyan-400" },
            { icon: CreditCard, title: t("step2Title"), desc: t("step2"), color: "from-violet-500 to-purple-400" },
            { icon: Sparkles, title: t("step3Title"), desc: t("step3"), color: "from-amber-500 to-orange-400" },
          ].map((step, i) => (
            <div key={i} className="group relative">
              <div className="relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-md`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                <div className="absolute -bottom-2 -right-2 text-[4rem] font-black leading-none text-muted/30">
                  {i + 1}
                </div>
              </div>
              {/* Arrow connector (hidden on mobile, visible between cards on desktop) */}
              {i < 2 && (
                <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                  <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Referral Code — Center Stage */}
      <div className="animate-fade-in-up-d2 mb-12">
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 p-8 sm:p-10">
          {/* Decorative glow */}
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-violet-500/8 blur-3xl" />

          <div className="relative text-center">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("yourCode")}
            </h2>

            {/* The Code */}
            <button
              onClick={copyCode}
              className="group mx-auto mt-4 block cursor-pointer rounded-xl border-2 border-primary/30 bg-card px-8 py-4 transition-all duration-200 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
            >
              <code className="text-3xl font-bold tracking-[0.3em] text-foreground sm:text-4xl">
                {stats?.referral_code || "--------"}
              </code>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors group-hover:text-primary">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">{t("copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{t("tapToCopy")}</span>
                  </>
                )}
              </div>
            </button>

            {/* Share link */}
            <div className="mx-auto mt-6 max-w-md">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-1.5 pl-4">
                <span className="flex-1 truncate text-left text-xs text-muted-foreground">
                  {referralLink || "---"}
                </span>
                <Button
                  variant={copiedLink ? "default" : "secondary"}
                  size="sm"
                  onClick={copyLink}
                  className={copiedLink ? "bg-green-500 hover:bg-green-500" : ""}
                >
                  {copiedLink ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      {t("copyLink")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="animate-fade-in-up-d3 mb-12 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl border bg-card p-4 text-center transition-all hover:shadow-md sm:p-6">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold sm:text-3xl">{stats.total_referrals}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("totalReferred")}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center transition-all hover:shadow-md sm:p-6">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold sm:text-3xl">{stats.total_reward_days}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("daysEarned")}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center transition-all hover:shadow-md sm:p-6">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
                <Gift className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-2xl font-bold sm:text-3xl">{stats.remaining}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("remaining")}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">{t("progressLabel")}</span>
              <span className="font-semibold">{completedCount}/{MAX_REFERRALS}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Referral History */}
      <div className="animate-fade-in-up-d4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5 text-primary" />
          {t("referralHistory")}
        </h2>

        {referrals.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 py-12 text-center">
            <Share2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t("noReferralsYet")}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            {referrals.map((r, i) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50 ${
                  i > 0 ? "border-t" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    r.status === "completed"
                      ? "bg-green-100 dark:bg-green-950"
                      : r.status === "pending"
                        ? "bg-amber-100 dark:bg-amber-950"
                        : "bg-red-100 dark:bg-red-950"
                  }`}>
                    {r.status === "completed" ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : r.status === "pending" ? (
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <span className="text-xs text-red-600 dark:text-red-400">!</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.referee_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  {r.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                      +{r.referrer_reward_days} {t("days")}
                    </span>
                  ) : r.status === "pending" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      <Clock className="h-3 w-3" />
                      {t("pending")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                      {t("fraud")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

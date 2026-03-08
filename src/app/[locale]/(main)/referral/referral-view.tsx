"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { getMyReferralCode, getReferralStats, getMyReferrals } from "@/lib/api/referrals";
import type { ReferralStats, ReferralItem } from "@/lib/api/referrals";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, Gift, Users, Calendar, Share2, Clock } from "lucide-react";

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
      // Ensure referral code exists
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
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl p-4 text-center">
        <p className="text-muted-foreground">{t("loginRequired")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("subtitle")}</p>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {t("howItWorks")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </div>
            <p className="text-sm">{t("step1")}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </div>
            <p className="text-sm">{t("step2")}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </div>
            <p className="text-sm">{t("step3")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code — available to all logged-in users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            {t("yourCode")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code display */}
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border bg-muted px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest">
              {stats?.referral_code || "—"}
            </code>
            <Button variant="outline" size="icon" onClick={copyCode}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Share link */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("shareLink")}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border bg-muted px-3 py-2 text-xs text-muted-foreground">
                {referralLink}
              </code>
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copiedLink ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Users className="h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.total_referrals}</p>
              <p className="text-xs text-muted-foreground">{t("totalReferred")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Calendar className="h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.total_reward_days}</p>
              <p className="text-xs text-muted-foreground">{t("daysEarned")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center pt-6">
              <Gift className="h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.remaining}</p>
              <p className="text-xs text-muted-foreground">{t("remaining")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Referral history */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("referralHistory")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{r.referee_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {r.status === "completed" ? (
                      <span className="text-xs font-medium text-green-600">
                        +{r.referrer_reward_days} {t("days")}
                      </span>
                    ) : r.status === "pending" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Clock className="h-3 w-3" />
                        {t("pending")}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600">
                        {t("fraud")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

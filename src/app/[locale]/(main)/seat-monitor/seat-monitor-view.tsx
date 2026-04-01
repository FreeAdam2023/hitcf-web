"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, BellOff, Crown, ExternalLink, HelpCircle, LogIn, MapPin, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@/i18n/navigation";
import type { CenterStatus } from "@/lib/api/seat-monitor";
import { getCenters, subscribeSeat, unsubscribeSeat } from "@/lib/api/seat-monitor";

export function SeatMonitorView() {
  const t = useTranslations("seatMonitorPage");
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const [centers, setCenters] = useState<CenterStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const isPro = isAuthenticated && hasActiveSubscription();
  const subscribedCount = centers.filter((c) => c.is_subscribed).length;

  const load = useCallback(async () => {
    try {
      const data = await getCenters();
      setCenters(data);
    } catch {
      // silent for guests
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (cityCode: string, isSubscribed: boolean) => {
    if (!isAuthenticated) return;
    setToggling(cityCode);
    try {
      if (isSubscribed) {
        await unsubscribeSeat(cityCode);
        toast.success(t("unsubscribed"));
      } else {
        await subscribeSeat(cityCode);
        toast.success(t("subscribed"));
      }
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("error");
      toast.error(msg);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center dark:from-blue-950/30 dark:to-indigo-950/30 sm:p-12">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
          <MapPin className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {t("title")}
          <Badge variant="outline" className="ml-2 align-middle text-xs font-normal text-blue-600 border-blue-300">Beta</Badge>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("subtitle")}</p>

        {!isAuthenticated && (
          <Link href="/login">
            <Button size="lg" className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <LogIn className="mr-2 h-4 w-4" />
              {t("loginCta")}
            </Button>
          </Link>
        )}

        {isAuthenticated && !isPro && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <Zap className="h-4 w-4" />
            {t("proUpsell")}
            <Link href="/pricing">
              <Button variant="link" size="sm" className="h-auto p-0 text-amber-700 dark:text-amber-300">
                {t("upgrade")}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* City cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("centersTitle")}</h2>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {centers.map((c) => (
              <CenterCard
                key={c.city_code}
                center={c}
                isAuthenticated={isAuthenticated}
                canSubscribeMore={isPro || subscribedCount < 1 || c.is_subscribed}
                toggling={toggling === c.city_code}
                onToggle={() => handleToggle(c.city_code, c.is_subscribed)}
              />
            ))}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {t("moreCities")}
          {" "}
          <Link href="/resources?tab=centers" className="inline-flex items-center gap-1 text-primary hover:underline">
            {t("viewAllCenters")}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          {t("faqTitle")}
        </h2>
        <Accordion type="single" collapsible className="rounded-lg border">
          {(["faq1", "faq2", "faq3", "faq4"] as const).map((key) => (
            <AccordionItem key={key} value={key} className="border-b last:border-b-0 px-4">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                {t(`${key}.q`)}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {t(`${key}.a`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function CenterCard({
  center,
  isAuthenticated,
  canSubscribeMore,
  toggling,
  onToggle,
}: {
  center: CenterStatus;
  isAuthenticated: boolean;
  canSubscribeMore: boolean;
  toggling: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("seatMonitorPage");
  const hasAvailability = center.available_dates.length > 0;

  return (
    <Card className={center.is_subscribed ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20" : ""}>
      <CardContent className="p-5">
        {/* Header: city info + status/action */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {center.is_subscribed ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              ) : (
                <span className={`h-2 w-2 shrink-0 rounded-full ${hasAvailability ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
              )}
              <h3 className="font-semibold">{center.city_name}</h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{center.center_name}</p>
          </div>

          <div className="shrink-0">
            {!isAuthenticated ? (
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Bell className="mr-1 h-3 w-3" />
                  {t("subscribeBtn")}
                </Button>
              </Link>
            ) : center.is_subscribed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <Bell className="h-3 w-3" />
                {t("monitoring")}
              </span>
            ) : canSubscribeMore ? (
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onToggle} disabled={toggling}>
                <Bell className="mr-1 h-3 w-3" />
                {t("subscribeBtn")}
              </Button>
            ) : (
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="h-8 text-xs text-amber-600">
                  <Crown className="mr-1 h-3 w-3" />
                  {t("upgradeToSubscribe")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Available dates or status */}
        <div className="mt-3 min-h-[1.5rem]">
          {hasAvailability ? (
            <div className="flex flex-wrap gap-1.5">
              {center.available_dates.map((d) => (
                <Badge key={d} variant="outline" className="text-xs font-normal">
                  {d}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noDates")}</p>
          )}
        </div>

        {/* Footer: last checked + unsubscribe */}
        <div className="mt-2 flex items-center justify-between">
          {center.last_checked_at ? (
            <p className="text-[11px] text-muted-foreground">
              {t("lastChecked", { time: _timeAgo(center.last_checked_at) })}
            </p>
          ) : <span />}
          {center.is_subscribed && (
            <button
              className="text-[11px] text-muted-foreground/60 hover:text-destructive transition-colors"
              onClick={onToggle}
              disabled={toggling}
            >
              {t("unsubscribeBtn")}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function _timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, BellOff, Crown, HelpCircle, LogIn, MapPin, RefreshCw, Zap } from "lucide-react";
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

      {/* How it works */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(["step1", "step2", "step3"] as const).map((key, i) => (
          <div key={key} className="flex items-start gap-3 rounded-lg border p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{t(`${key}.title`)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(`${key}.desc`)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Free vs Pro comparison */}
      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-3 text-center text-sm font-medium">
          <div className="p-3 bg-muted/50" />
          <div className="p-3 bg-muted/50">{t("compareFree")}</div>
          <div className="p-3 bg-primary/10 text-primary">{t("comparePro")}</div>
        </div>
        <div className="grid grid-cols-3 text-center text-sm border-t">
          <div className="p-3 text-left text-muted-foreground">{t("compareDelay")}</div>
          <div className="p-3 text-amber-600 font-medium">{t("compareDelay30")}</div>
          <div className="p-3 text-emerald-600 font-medium flex items-center justify-center gap-1"><Zap className="h-3.5 w-3.5" />{t("compareDelayInstant")}</div>
        </div>
        <div className="grid grid-cols-3 text-center text-sm border-t">
          <div className="p-3 text-left text-muted-foreground">{t("compareCities")}</div>
          <div className="p-3">1</div>
          <div className="p-3 text-emerald-600 font-medium">{t("compareUnlimited")}</div>
        </div>
        {!isPro && isAuthenticated && (
          <div className="border-t bg-amber-50/50 dark:bg-amber-950/20 p-3 text-center">
            <Link href="/pricing">
              <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <Crown className="mr-1.5 h-3.5 w-3.5" />
                {t("upgradeNow")}
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
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {centers.map((c) => (
              <CenterCard
                key={c.city_code}
                center={c}
                isPro={isPro}
                isAuthenticated={isAuthenticated}
                canSubscribeMore={isPro || subscribedCount < 1 || c.is_subscribed}
                toggling={toggling === c.city_code}
                onToggle={() => handleToggle(c.city_code, c.is_subscribed)}
              />
            ))}
          </div>
        )}
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
  isPro,
  isAuthenticated,
  canSubscribeMore,
  toggling,
  onToggle,
}: {
  center: CenterStatus;
  isPro: boolean;
  isAuthenticated: boolean;
  canSubscribeMore: boolean;
  toggling: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("seatMonitorPage");
  const hasAvailability = center.available_dates.length > 0;

  return (
    <Card className={center.is_subscribed ? "border-primary/40 bg-primary/5" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${hasAvailability ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
              <h3 className="font-semibold">{center.city_name}</h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{center.center_name}</p>
          </div>

          {center.is_subscribed && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {isPro ? (
                <><Zap className="mr-1 h-3 w-3" />{t("realtime")}</>
              ) : (
                <>{t("delayed")}</>
              )}
            </Badge>
          )}
        </div>

        {/* Available dates */}
        <div className="mt-3 min-h-[2rem]">
          {center.scrape_status === "pending" ? (
            <p className="text-sm text-muted-foreground">{t("checking")}</p>
          ) : hasAvailability ? (
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

        {/* Last checked */}
        {center.last_checked_at && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t("lastChecked", { time: _timeAgo(center.last_checked_at) })}
          </p>
        )}

        {/* Subscribe button */}
        <div className="mt-3">
          {!isAuthenticated ? (
            <Link href="/login" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                {t("loginToSubscribe")}
              </Button>
            </Link>
          ) : center.is_subscribed ? (
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onToggle} disabled={toggling}>
              <BellOff className="mr-1.5 h-3.5 w-3.5" />
              {t("unsubscribeBtn")}
            </Button>
          ) : canSubscribeMore ? (
            <Button variant="default" size="sm" className="w-full" onClick={onToggle} disabled={toggling}>
              <Bell className="mr-1.5 h-3.5 w-3.5" />
              {t("subscribeBtn")}
            </Button>
          ) : (
            <Link href="/pricing" className="w-full">
              <Button variant="outline" size="sm" className="w-full text-amber-600">
                <Crown className="mr-1.5 h-3.5 w-3.5" />
                {t("upgradeToSubscribe")}
              </Button>
            </Link>
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

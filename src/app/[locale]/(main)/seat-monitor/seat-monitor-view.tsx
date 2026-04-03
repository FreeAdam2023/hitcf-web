"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Bell,
  BellOff,
  Clock,
  ExternalLink,
  HelpCircle,
  Loader2,
  LogIn,
  MapPin,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { Link, useRouter } from "@/i18n/navigation";
import type { CenterStatus } from "@/lib/api/seat-monitor";
import { getCenters, subscribeSeat, unsubscribeSeat } from "@/lib/api/seat-monitor";
import { cn } from "@/lib/utils";

/* ── Helpers ── */

function formatExamDate(isoDate: string, locale: string): string {
  try {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString(locale === "zh" ? "zh-CN" : locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  } catch {
    return isoDate;
  }
}

function seatColor(seats: number | null | undefined): string {
  if (seats === null || seats === undefined) return "text-muted-foreground";
  if (seats === 0) return "text-gray-400";
  if (seats < 10) return "text-red-600 dark:text-red-400";
  if (seats <= 20) return "text-orange-500 dark:text-orange-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function seatBg(seats: number | null | undefined): string {
  if (seats === null || seats === undefined) return "bg-muted";
  if (seats === 0) return "bg-gray-100 dark:bg-gray-800";
  if (seats < 10) return "bg-red-50 dark:bg-red-950/30";
  if (seats <= 20) return "bg-orange-50 dark:bg-orange-950/30";
  return "bg-emerald-50 dark:bg-emerald-950/30";
}

function statusSummary(center: CenterStatus): "available" | "sold_out" | "none" | "checking" {
  if (center.scrape_status !== "success") return "checking";
  if (center.available_dates.length === 0) return "none";
  const allZero = center.available_dates.every(
    (d) => center.seats_by_date[d] === 0,
  );
  return allZero ? "sold_out" : "available";
}

/* ── Component ── */

export function SeatMonitorView() {
  const t = useTranslations("seatMonitorPage");
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const [centers, setCenters] = useState<CenterStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCities, setSavingCities] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  const isPro = isAuthenticated && hasActiveSubscription();

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
    // Auto-refresh every 60s
    const refreshTimer = setInterval(load, 60_000);
    // Tick for relative time display
    const tickTimer = setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
    }, 10_000);
    return () => {
      clearInterval(refreshTimer);
      clearInterval(tickTimer);
    };
  }, [load]);

  const handleToggleFollow = async (cityCode: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setSavingCities((prev) => new Set(prev).add(cityCode));
    try {
      const center = centers.find((c) => c.city_code === cityCode);
      if (center?.is_subscribed) {
        await unsubscribeSeat(cityCode);
        toast.success(t("unfollowed"));
      } else {
        await subscribeSeat(cityCode);
        toast.success(t("subscribed"));
      }
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("error");
      if (String(msg).includes("1 city")) {
        toast.error(t("freeLimit"));
      } else {
        toast.error(msg);
      }
    } finally {
      setSavingCities((prev) => {
        const n = new Set(prev);
        n.delete(cityCode);
        return n;
      });
    }
  };

  const formatTimeAgo = (iso: string | null): string => {
    void tick; // depend on tick for reactivity
    if (!iso) return "";
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 60) return t("secondsAgo", { seconds: Math.max(sec, 1) });
    if (sec < 3600) return t("minutesAgo", { minutes: Math.floor(sec / 60) });
    return t("hoursAgo", { hours: Math.floor(sec / 3600) });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl flex items-center justify-center gap-2">
          {t("title")}
          <Badge variant="outline" className="text-xs font-normal text-blue-600 border-blue-300">
            Beta
          </Badge>
          {!loading && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          )}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* City Cards */}
          <div className="space-y-4">
            {centers.map((center) => {
              const status = statusSummary(center);
              const isSaving = savingCities.has(center.city_code);

              return (
                <Card key={center.city_code} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold">{center.city_name}</h2>
                          {status === "available" && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                              {t("statusAvailable")}
                            </Badge>
                          )}
                          {status === "sold_out" && (
                            <Badge variant="destructive">{t("statusSoldOut")}</Badge>
                          )}
                          {status === "none" && (
                            <Badge variant="secondary">{t("statusNone")}</Badge>
                          )}
                          {status === "checking" && (
                            <Badge variant="outline">{t("statusChecking")}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {center.center_name}
                        </p>
                        {center.address && (
                          <a
                            href={center.maps_url || `https://maps.google.com/?q=${encodeURIComponent(center.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1 transition-colors"
                          >
                            <MapPin className="h-3 w-3 shrink-0" />
                            {center.address}
                          </a>
                        )}
                      </div>
                      {/* Follow button */}
                      <Button
                        variant={center.is_subscribed ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "shrink-0",
                          center.is_subscribed && "bg-primary",
                        )}
                        onClick={() => handleToggleFollow(center.city_code)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : center.is_subscribed ? (
                          <>
                            <Bell className="mr-1.5 h-3.5 w-3.5" />
                            {t("following")}
                          </>
                        ) : (
                          <>
                            <BellOff className="mr-1.5 h-3.5 w-3.5" />
                            {t("follow")}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {center.available_dates.length > 0 ? (
                      <div className="space-y-2">
                        {center.available_dates.map((date) => {
                          const seats = center.seats_by_date[date];
                          return (
                            <div
                              key={date}
                              className={cn(
                                "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5",
                                seatBg(seats),
                              )}
                            >
                              <span className="text-sm font-medium">
                                {formatExamDate(date, locale)}
                              </span>
                              <div className="flex items-center gap-3">
                                {seats !== undefined && seats !== null && (
                                  <span
                                    className={cn(
                                      "text-sm font-semibold tabular-nums",
                                      seatColor(seats),
                                      seats > 0 && seats < 10 && "animate-pulse",
                                    )}
                                  >
                                    {t("seatsLeft", { count: seats })}
                                  </span>
                                )}
                                <a
                                  href={center.registration_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                                >
                                  {t("registerNow")}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        {t("noDates")}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0 text-xs text-muted-foreground">
                    <div className="flex w-full items-center justify-between">
                      <span>
                        {center.is_subscribed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Bell className="h-3 w-3" />
                            {isPro ? t("priorityNotify") : t("queueNotify")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">
                            {t("monitoringSubtitle")}
                          </span>
                        )}
                      </span>
                      {center.last_checked_at && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(center.last_checked_at)}
                        </span>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Coming soon */}
          <p className="text-center text-sm text-muted-foreground">
            {t("moreCities")}
          </p>

          {/* Pro upsell for non-pro */}
          {!isPro && (
            <div className="rounded-xl border bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-center dark:from-amber-950/20 dark:to-orange-950/20">
              <p className="text-sm font-medium">
                {t("proUpsell")}
              </p>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  {t("upgradeNow")}
                </Button>
              </Link>
            </div>
          )}

          {/* Guest login prompt */}
          {!isAuthenticated && (
            <div className="rounded-xl border p-5 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {t("loginToSubscribe")}
              </p>
              <Link href="/login">
                <Button>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t("loginCta")}
                </Button>
              </Link>
            </div>
          )}

          {/* FAQ */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              {t("faqTitle")}
            </h2>
            <Accordion type="single" collapsible className="rounded-lg border">
              {(["faq1", "faq2", "faq3", "faq4"] as const).map((key) => (
                <AccordionItem
                  key={key}
                  value={key}
                  className="border-b last:border-b-0 px-4"
                >
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
        </>
      )}
    </div>
  );
}

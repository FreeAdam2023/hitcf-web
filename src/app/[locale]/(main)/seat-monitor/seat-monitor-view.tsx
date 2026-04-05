"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Bell,
  ExternalLink,
  HelpCircle,
  Loader2,
  LogIn,
  MapPin,
  Plus,
  Settings,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const allZero = center.available_dates.every((d) => center.seats_by_date[d] === 0);
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
  const [showManage, setShowManage] = useState(false);

  const isPro = isAuthenticated && hasActiveSubscription();

  const load = useCallback(async () => {
    try {
      const data = await getCenters();
      setCenters(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // 15s polling matches backend scrape cadence — email is only a "tickle"
    // that drives users here; the live view is the source of truth.
    const refreshTimer = setInterval(load, 15_000);
    return () => clearInterval(refreshTimer);
  }, [load]);

  const handleToggleFollow = async (cityCode: string) => {
    if (!isAuthenticated) {
      router.push("/register");
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

  const followedCenters = centers
    .filter((c) => c.is_subscribed)
    .sort((a, b) => b.available_dates.length - a.available_dates.length);

  const isPersonalView = isAuthenticated && followedCenters.length > 0 && !showManage;
  const isPickerView = isAuthenticated && (followedCenters.length === 0 || showManage);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl flex items-center justify-center gap-2">
          {t("title")}
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
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : isPersonalView ? (
        /* ══════ Logged-in user: show only followed cities ══════ */
        <>
          {followedCenters.map((center) => {
            const status = statusSummary(center);
            return status === "available" ? (
              <AvailableCard
                key={center.city_code}
                center={center}
                isSaving={savingCities.has(center.city_code)}
                locale={locale}
                t={t}
                onToggleFollow={handleToggleFollow}
              />
            ) : (
              /* Followed but no seats — compact inline */
              <div key={center.city_code} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Bell className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{center.city_name}</p>
                    <p className="text-xs text-muted-foreground">{t("noDates")}</p>
                  </div>
                </div>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>
            );
          })}

          {/* Manage button */}
          <div className="text-center">
            <button
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setShowManage(true)}
            >
              <Settings className="h-3.5 w-3.5" />
              {t("manageCities")}
            </button>
          </div>

          {/* Manage dialog */}
          <ManageDialog
            open={showManage}
            onClose={() => setShowManage(false)}
            centers={centers}
            savingCities={savingCities}
            onToggleFollow={handleToggleFollow}
            t={t}
          />

          {/* Pro upsell */}
          {!isPro && <ProUpsell t={t} />}
        </>
      ) : isPickerView ? (
        /* ══════ City picker (no follows yet) ══════ */
        <>
          <p className="text-center text-sm text-muted-foreground">{t("pickCitiesHint")}</p>
          <CityGrid
            centers={centers}
            savingCities={savingCities}
            onToggleFollow={handleToggleFollow}
            t={t}
          />
          {!isPro && <ProUpsell t={t} />}
        </>
      ) : (
        /* ══════ Guest: showcase all cities + register CTA ══════ */
        <>
          {/* Hero banner if seats exist */}
          {centers.some((c) => statusSummary(c) === "available") && (
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-700 dark:bg-emerald-950/30">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                🎉 {centers.filter((c) => statusSummary(c) === "available").map((c) => c.city_name).join(" · ")} {t("seatsFound")}
              </p>
            </div>
          )}

          {/* All cities */}
          <div className="space-y-3">
            {centers.map((center) => {
              const status = statusSummary(center);
              return status === "available" ? (
                <AvailableCard
                  key={center.city_code}
                  center={center}
                  isSaving={false}
                  locale={locale}
                  t={t}
                  onToggleFollow={handleToggleFollow}
                />
              ) : (
                <div key={center.city_code} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{center.city_name}</p>
                    <p className="text-xs text-muted-foreground">{center.center_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{t("noDates")}</span>
                </div>
              );
            })}
          </div>

          {/* Register CTA */}
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-base font-medium mb-1">{t("registerToFollow")}</p>
            <p className="text-sm text-muted-foreground mb-4">{t("registerToFollowDesc")}</p>
            <Link href="/register">
              <Button size="lg">
                <LogIn className="mr-2 h-4 w-4" />
                {t("registerCta")}
              </Button>
            </Link>
          </div>
        </>
      )}

      {/* FAQ — always shown */}
      {!loading && (
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
      )}
    </div>
  );
}

/* ── Available City Card ── */

const MAX_VISIBLE_DATES = 3;

function AvailableCard({
  center,
  isSaving,
  locale,
  t,
  onToggleFollow,
}: {
  center: CenterStatus;
  isSaving: boolean;
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  onToggleFollow: (cityCode: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dates = center.available_dates;
  const hasMore = dates.length > MAX_VISIBLE_DATES;
  const visibleDates = expanded ? dates : dates.slice(0, MAX_VISIBLE_DATES);

  return (
    <Card className="overflow-hidden border-2 border-emerald-200 dark:border-emerald-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{center.city_name}</h2>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                {dates.length} {t("statusAvailable")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{center.center_name}</p>
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
          <button
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              center.is_subscribed
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "text-muted-foreground hover:text-primary hover:bg-muted",
            )}
            onClick={() => onToggleFollow(center.city_code)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : center.is_subscribed ? (
              <>
                <Bell className="h-3.5 w-3.5" />
                {t("following")}
              </>
            ) : (
              <>
                <Bell className="h-3.5 w-3.5" />
                {t("follow")}
              </>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-1.5">
          {visibleDates.map((date) => {
            const seats = center.seats_by_date[date];
            return (
              <div
                key={date}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2",
                  seatBg(seats),
                )}
              >
                <span className="text-sm">{formatExamDate(date, locale)}</span>
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
              </div>
            );
          })}
        </div>
        {hasMore && (
          <button
            className="mt-1 w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors py-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded
              ? t("collapse")
              : t("showMore", { count: dates.length - MAX_VISIBLE_DATES })}
          </button>
        )}
        <a
          href={center.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          {t("registerNow")}
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardContent>

      <CardFooter className="pt-2 text-xs text-muted-foreground">
        <div className="flex w-full items-center justify-between">
          <span>
            {center.is_subscribed && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Bell className="h-3 w-3" />
                {t("priorityNotify")}
              </span>
            )}
          </span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

/* ── Pro Upsell ── */

/* ── Manage Cities Dialog ── */

function ManageDialog({
  open,
  onClose,
  centers,
  savingCities,
  onToggleFollow,
  t,
}: {
  open: boolean;
  onClose: () => void;
  centers: CenterStatus[];
  savingCities: Set<string>;
  onToggleFollow: (cityCode: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("manageCities")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {centers.map((center) => {
            const isSaving = savingCities.has(center.city_code);
            const hasSeats = center.available_dates.length > 0;
            return (
              <div
                key={center.city_code}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3",
                  hasSeats && "border-emerald-200 dark:border-emerald-800",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{center.city_name}</p>
                    {hasSeats && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {center.available_dates.length}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{center.center_name}</p>
                </div>
                <button
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    center.is_subscribed
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "text-muted-foreground hover:text-primary hover:bg-muted",
                  )}
                  onClick={() => onToggleFollow(center.city_code)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : center.is_subscribed ? (
                    <>
                      <Bell className="h-3 w-3" />
                      {t("following")}
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      {t("follow")}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── City Grid (for first-time picker) ── */

function CityGrid({
  centers,
  savingCities,
  onToggleFollow,
  t,
}: {
  centers: CenterStatus[];
  savingCities: Set<string>;
  onToggleFollow: (cityCode: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {centers.map((center) => {
        const isSaving = savingCities.has(center.city_code);
        const hasSeats = center.available_dates.length > 0;
        return (
          <Card key={center.city_code} className={cn("overflow-hidden", hasSeats && "border-emerald-200 dark:border-emerald-800")}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{center.city_name}</h3>
                    {hasSeats && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {center.available_dates.length} {t("statusAvailable")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{center.center_name}</p>
                </div>
                <button
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    center.is_subscribed
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "text-muted-foreground hover:text-primary hover:bg-muted",
                  )}
                  onClick={() => onToggleFollow(center.city_code)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : center.is_subscribed ? (
                    <>
                      <Bell className="h-3 w-3" />
                      {t("following")}
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      {t("follow")}
                    </>
                  )}
                </button>
              </div>
            </CardHeader>
            <CardFooter className="p-4 pt-1 text-[11px] text-muted-foreground">
              {center.address && (
                <a
                  href={center.maps_url || `https://maps.google.com/?q=${encodeURIComponent(center.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors truncate"
                >
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{center.address}</span>
                </a>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Pro Upsell ── */

function ProUpsell({ t }: { t: (key: string) => string }) {
  return (
    <div className="rounded-xl border bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-center dark:from-amber-950/20 dark:to-orange-950/20">
      <p className="text-sm font-medium">{t("proUpsell")}</p>
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
  );
}

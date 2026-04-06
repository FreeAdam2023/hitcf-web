"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

/* ── City grouping ── */

interface CityGroup {
  city_code: string;
  city_name: string;
  is_subscribed: boolean;
  centers: CenterStatus[];
  totalDates: number;
}

function groupByCity(centers: CenterStatus[]): CityGroup[] {
  const map = new Map<string, CityGroup>();
  for (const c of centers) {
    let group = map.get(c.city_code);
    if (!group) {
      group = {
        city_code: c.city_code,
        city_name: c.city_name,
        is_subscribed: c.is_subscribed,
        centers: [],
        totalDates: 0,
      };
      map.set(c.city_code, group);
    }
    group.centers.push(c);
    group.totalDates += c.available_dates.length;
    // Any center subscribed means city is subscribed
    if (c.is_subscribed) group.is_subscribed = true;
  }
  return Array.from(map.values());
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
    // 15s polling matches backend scrape cadence
    const refreshTimer = setInterval(load, 15_000);
    return () => clearInterval(refreshTimer);
  }, [load]);

  const cityGroups = useMemo(() => groupByCity(centers), [centers]);

  const handleToggleFollow = async (cityCode: string) => {
    if (!isAuthenticated) {
      router.push("/register");
      return;
    }
    setSavingCities((prev) => new Set(prev).add(cityCode));
    try {
      const group = cityGroups.find((g) => g.city_code === cityCode);
      if (group?.is_subscribed) {
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

  const followedGroups = cityGroups
    .filter((g) => g.is_subscribed)
    .sort((a, b) => b.totalDates - a.totalDates);

  const isPersonalView = isAuthenticated && followedGroups.length > 0 && !showManage;
  const isPickerView = isAuthenticated && (followedGroups.length === 0 || showManage);

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
        /* ══════ Logged-in: show followed cities ══════ */
        <>
          {followedGroups.map((group) => (
            <CityCard
              key={group.city_code}
              group={group}
              isSaving={savingCities.has(group.city_code)}
              locale={locale}
              t={t}
              onToggleFollow={handleToggleFollow}
            />
          ))}

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

          <ManageDialog
            open={showManage}
            onClose={() => setShowManage(false)}
            cityGroups={cityGroups}
            savingCities={savingCities}
            onToggleFollow={handleToggleFollow}
            t={t}
          />

          {!isPro && <ProUpsell t={t} />}
        </>
      ) : isPickerView ? (
        /* ══════ City picker ══════ */
        <>
          <p className="text-center text-sm text-muted-foreground">{t("pickCitiesHint")}</p>
          <div className="space-y-3">
            {cityGroups.map((group) => (
              <CityPickerItem
                key={group.city_code}
                group={group}
                isSaving={savingCities.has(group.city_code)}
                onToggleFollow={handleToggleFollow}
                t={t}
              />
            ))}
          </div>
          {!isPro && <ProUpsell t={t} />}
        </>
      ) : (
        /* ══════ Guest ══════ */
        <>
          {cityGroups.some((g) => g.totalDates > 0) && (
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-700 dark:bg-emerald-950/30">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                🎉 {cityGroups.filter((g) => g.totalDates > 0).map((g) => g.city_name).join(" · ")} {t("seatsFound")}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {cityGroups.map((group) => (
              <CityCard
                key={group.city_code}
                group={group}
                isSaving={false}
                locale={locale}
                t={t}
                onToggleFollow={handleToggleFollow}
              />
            ))}
          </div>

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

      {/* FAQ */}
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

/* ── City Card — groups all centers under one city ── */

const MAX_VISIBLE_DATES = 3;

function CityCard({
  group,
  isSaving,
  locale,
  t,
  onToggleFollow,
}: {
  group: CityGroup;
  isSaving: boolean;
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  onToggleFollow: (cityCode: string) => void;
}) {
  const hasAnyDates = group.totalDates > 0;

  return (
    <Card className={cn("overflow-hidden", hasAnyDates && "border-2 border-emerald-200 dark:border-emerald-800")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{group.city_name}</h2>
              {hasAnyDates && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                  {group.totalDates} {t("statusAvailable")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {group.centers.length} {group.centers.length === 1 ? "center" : "centers"}
            </p>
          </div>
          <button
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              group.is_subscribed
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "text-muted-foreground hover:text-primary hover:bg-muted",
            )}
            onClick={() => onToggleFollow(group.city_code)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : group.is_subscribed ? (
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

      <CardContent className="pt-0 space-y-3">
        {group.centers.map((center) => (
          <CenterSection key={center.center_id} center={center} locale={locale} t={t} />
        ))}

        {group.is_subscribed && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Bell className="h-3 w-3" />
              {t("priorityNotify")}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Center Section — one center within a city card ── */

function CenterSection({
  center,
  locale,
  t,
}: {
  center: CenterStatus;
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const dates = center.available_dates;
  const hasDates = dates.length > 0;
  const hasMore = dates.length > MAX_VISIBLE_DATES;
  const visibleDates = expanded ? dates : dates.slice(0, MAX_VISIBLE_DATES);

  return (
    <div className="rounded-lg border bg-card px-3 py-2.5">
      {/* Center header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{center.center_name}</p>
          {center.address && (
            <a
              href={center.maps_url || `https://maps.google.com/?q=${encodeURIComponent(center.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              {center.address}
            </a>
          )}
        </div>
        <a
          href={center.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            hasDates
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:text-foreground border",
          )}
        >
          {t("registerNow")}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Dates */}
      {hasDates && (
        <div className="mt-2 space-y-1">
          {visibleDates.map((date) => {
            const seats = center.seats_by_date[date];
            return (
              <div
                key={date}
                className={cn(
                  "flex items-center justify-between gap-3 rounded px-2.5 py-1.5",
                  seatBg(seats),
                )}
              >
                <span className="text-xs">{formatExamDate(date, locale)}</span>
                {seats !== undefined && seats !== null && (
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
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
          {hasMore && (
            <button
              className="w-full text-center text-[11px] text-muted-foreground hover:text-primary transition-colors py-0.5"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded
                ? t("collapse")
                : t("showMore", { count: dates.length - MAX_VISIBLE_DATES })}
            </button>
          )}
        </div>
      )}

      {!hasDates && (
        <p className="text-[11px] text-muted-foreground mt-1">{t("noDates")}</p>
      )}
    </div>
  );
}

/* ── City Picker Item (for first-time / manage view) ── */

function CityPickerItem({
  group,
  isSaving,
  onToggleFollow,
  t,
}: {
  group: CityGroup;
  isSaving: boolean;
  onToggleFollow: (cityCode: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <div className={cn(
      "rounded-lg border px-4 py-3",
      group.totalDates > 0 && "border-emerald-200 dark:border-emerald-800",
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{group.city_name}</h3>
            {group.totalDates > 0 && (
              <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">
                {group.totalDates} {t("statusAvailable")}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {group.centers.map((c) => c.center_name).join(" · ")}
          </p>
        </div>
        <button
          className={cn(
            "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            group.is_subscribed
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "text-muted-foreground hover:text-primary hover:bg-muted",
          )}
          onClick={() => onToggleFollow(group.city_code)}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : group.is_subscribed ? (
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
    </div>
  );
}

/* ── Manage Cities Dialog ── */

function ManageDialog({
  open,
  onClose,
  cityGroups,
  savingCities,
  onToggleFollow,
  t,
}: {
  open: boolean;
  onClose: () => void;
  cityGroups: CityGroup[];
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
          {cityGroups.map((group) => (
            <CityPickerItem
              key={group.city_code}
              group={group}
              isSaving={savingCities.has(group.city_code)}
              onToggleFollow={onToggleFollow}
              t={t}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
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

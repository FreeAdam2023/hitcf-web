"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle, LogIn, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@/i18n/navigation";
import type { CenterStatus } from "@/lib/api/seat-monitor";
import { getCenters, subscribeSeat, unsubscribeSeat } from "@/lib/api/seat-monitor";
import { cn } from "@/lib/utils";

type ViewState = "guest" | "picker" | "monitoring";

export function SeatMonitorView() {
  const t = useTranslations("seatMonitorPage");
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const [centers, setCenters] = useState<CenterStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manualView, setManualView] = useState<ViewState | null>(null);
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());

  const isPro = isAuthenticated && hasActiveSubscription();
  const subscribedCenters = centers.filter((c) => c.is_subscribed);
  const hasAvailableDates = subscribedCenters.some(
    (c) => c.available_dates.length > 0,
  );

  // Auto-compute view; guest always wins; manualView overrides when set
  const viewState: ViewState = !isAuthenticated
    ? "guest"
    : manualView ??
      (centers.some((c) => c.is_subscribed) ? "monitoring" : "picker");

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

  /* ── City chip toggle ── */
  const toggleCity = (cityCode: string) => {
    setSelectedCities((prev) => {
      const next = new Set(prev);
      if (next.has(cityCode)) {
        next.delete(cityCode);
      } else {
        if (!isPro && next.size >= 1) return prev;
        next.add(cityCode);
      }
      return next;
    });
  };

  /* ── Start / Save ── */
  const handleSave = async () => {
    setSaving(true);
    const currentlySubscribed = new Set(
      subscribedCenters.map((c) => c.city_code),
    );
    const toSubscribe = Array.from(selectedCities).filter(
      (c) => !currentlySubscribed.has(c),
    );
    const toUnsubscribe = Array.from(currentlySubscribed).filter(
      (c) => !selectedCities.has(c),
    );

    try {
      await Promise.all([
        ...toSubscribe.map((c) => subscribeSeat(c)),
        ...toUnsubscribe.map((c) => unsubscribeSeat(c)),
      ]);
      await load();
      setManualView(null);
      toast.success(t("subscribed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit cities ── */
  const handleEditCities = () => {
    setSelectedCities(new Set(subscribedCenters.map((c) => c.city_code)));
    setManualView("picker");
  };

  /* ── Stop monitoring ── */
  const handleStop = async () => {
    setSaving(true);
    try {
      await Promise.all(
        subscribedCenters.map((c) => unsubscribeSeat(c.city_code)),
      );
      await load();
      setSelectedCities(new Set());
      setManualView(null);
      toast.success(t("unsubscribed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setSaving(false);
    }
  };

  const isEditing = subscribedCenters.length > 0 && viewState === "picker";

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      {loading ? (
        /* ── Loading ── */
        <div className="flex flex-col items-center gap-4 py-20">
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : viewState === "guest" ? (
        /* ── Guest View ── */
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <Heartbeat active={false} />

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {t("title")}
              <Badge
                variant="outline"
                className="ml-2 align-middle text-xs font-normal text-blue-600 border-blue-300"
              >
                Beta
              </Badge>
            </h1>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <Link href="/login">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {t("loginCta")}
            </Button>
          </Link>
        </div>
      ) : viewState === "picker" ? (
        /* ── Picker View ── */
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              {t("selectCity")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* City chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {centers.map((c) => {
              const isSelected = selectedCities.has(c.city_code);
              const canSelect = isSelected || isPro || selectedCities.size < 1;
              return (
                <button
                  key={c.city_code}
                  onClick={() => canSelect && toggleCity(c.city_code)}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : canSelect
                        ? "border-border hover:border-primary/50 hover:bg-primary/5"
                        : "border-border opacity-40 cursor-not-allowed",
                  )}
                >
                  {c.city_name}
                </button>
              );
            })}
          </div>

          {/* Free / Pro hint */}
          <p className="text-sm text-muted-foreground">
            {isPro ? (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Zap className="h-3.5 w-3.5" />
                {t("proUnlimited")}
              </span>
            ) : (
              <>
                {t("freeLimit")}
                <span className="mx-1.5">·</span>
                <Link
                  href="/pricing"
                  className="text-primary hover:underline"
                >
                  {t("upgrade")}
                </Link>
              </>
            )}
          </p>

          {/* Action */}
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 px-10"
            disabled={selectedCities.size === 0 || saving}
            onClick={handleSave}
          >
            {isEditing ? t("saveCities") : t("startMonitoring")}
          </Button>

          {/* More cities */}
          <p className="text-xs text-muted-foreground">
            {t("moreCities")}{" "}
            <Link
              href="/resources?tab=centers"
              className="text-primary hover:underline"
            >
              {t("viewAllCenters")}
            </Link>
          </p>
        </div>
      ) : (
        /* ── Monitoring View ── */
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <Heartbeat active />

          {hasAvailableDates ? (
            /* Excited state: seats found */
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {t("seatsFound")}
              </h2>
              {subscribedCenters
                .filter((c) => c.available_dates.length > 0)
                .map((c) => (
                  <div key={c.city_code}>
                    <p className="text-sm font-medium">{c.city_name}</p>
                    <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                      {c.available_dates.map((d) => (
                        <Badge
                          key={d}
                          variant="outline"
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                        >
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              <Link href="/resources?tab=centers">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-600"
                >
                  {t("bookNow")} →
                </Button>
              </Link>
            </div>
          ) : (
            /* Normal state: monitoring */
            <div>
              <h2 className="text-xl font-bold">{t("monitoring")}</h2>
              <p className="mt-1 text-lg text-muted-foreground">
                {subscribedCenters.map((c) => c.city_name).join(" · ")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("monitoringSubtitle")}
              </p>
            </div>
          )}

          {/* Pro / Free badge */}
          {isPro ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <Zap className="h-3 w-3" />
              {t("priorityNotify")}
            </span>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("queueNotify")}
              <span className="mx-1.5">·</span>
              <Link
                href="/pricing"
                className="text-primary hover:underline"
              >
                {t("upgrade")}
              </Link>
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleEditCities}>
              {t("editCities")}
            </Button>
            <button
              className="text-sm text-muted-foreground/60 hover:text-destructive transition-colors"
              onClick={handleStop}
              disabled={saving}
            >
              {t("stopMonitoring")}
            </button>
          </div>
        </div>
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
      )}
    </div>
  );
}

/* ── Heartbeat Animation ── */
function Heartbeat({ active }: { active: boolean }) {
  const color = active
    ? "bg-emerald-400"
    : "bg-gray-300 dark:bg-gray-600";
  const dotColor = active
    ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
    : "bg-gray-400 dark:bg-gray-500";

  return (
    <div className="relative h-28 w-28">
      <span
        className={cn("absolute inset-0 animate-ping rounded-full opacity-20", color)}
        style={{ animationDuration: "2s" }}
      />
      <span
        className={cn("absolute inset-4 animate-ping rounded-full opacity-20", color)}
        style={{ animationDuration: "2s", animationDelay: "0.5s" }}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className={cn("h-5 w-5 rounded-full", dotColor)} />
      </span>
    </div>
  );
}

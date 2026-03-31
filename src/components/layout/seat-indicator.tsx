"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getCenters, type CenterStatus } from "@/lib/api/seat-monitor";

export function SeatIndicator() {
  const t = useTranslations("nav");
  const [centers, setCenters] = useState<CenterStatus[]>([]);

  const load = useCallback(() => {
    getCenters()
      .then(setCenters)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 300_000); // 5 min
    return () => clearInterval(timer);
  }, [load]);

  const available = centers.filter((c) => c.available_dates.length > 0);
  const hasSeats = available.length > 0;

  const tooltip = hasSeats
    ? t("seatAvailable", { cities: available.map((c) => c.city_name).join(", ") })
    : t("seatNone");

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-8 w-8"
      asChild
    >
      <Link href="/seat-monitor" title={tooltip}>
        <MapPin className="h-4 w-4" />
        <span
          className={`absolute right-1 top-1 h-2 w-2 rounded-full ${
            hasSeats
              ? "bg-green-500 animate-pulse"
              : "bg-muted-foreground/30"
          }`}
        />
        <span className="sr-only">{tooltip}</span>
      </Link>
    </Button>
  );
}

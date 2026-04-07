"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { GraduationCap, CalendarCheck, MailX, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getUnsubInfo, confirmEmailUnsub, type UnsubInfo } from "@/lib/api/seat-monitor";

type Status = "loading" | "ready" | "submitting" | "done" | "error";

const REASONS = [
  { key: "passed_exam", icon: GraduationCap, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "got_seat", icon: CalendarCheck, color: "text-blue-600 dark:text-blue-400" },
  { key: "no_emails", icon: MailX, color: "text-gray-600 dark:text-gray-400" },
] as const;

export default function UnsubscribePage() {
  const t = useTranslations("seatMonitorPage.unsub");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<Status>("loading");
  const [info, setInfo] = useState<UnsubInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("missing_token");
      return;
    }
    getUnsubInfo(token)
      .then((data) => {
        setInfo(data);
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
        setError("invalid_token");
      });
  }, [token]);

  const handleReason = async (reason: string) => {
    setStatus("submitting");
    try {
      await confirmEmailUnsub(token, reason);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("submit_failed");
    }
  };

  return (
    <div className="mx-auto max-w-md py-12 px-4">
      {status === "loading" && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {status === "error" && (
        <Card>
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="text-lg font-semibold">{t("errorTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("errorDesc")}</p>
            <Link href="/seat-monitor">
              <Button variant="outline" className="mt-2">{t("backToMonitor")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {(status === "ready" || status === "submitting") && info && (
        <Card>
          <CardContent className="pt-8 pb-6 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground">
                {t("subtitle", { city: info.city_name })}
              </p>
            </div>

            <div className="space-y-3">
              {REASONS.map(({ key, icon: Icon, color }) => (
                <button
                  key={key}
                  disabled={status === "submitting"}
                  onClick={() => handleReason(key)}
                  className="w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t(`reason.${key}`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`reasonDesc.${key}`)}</p>
                  </div>
                  {status === "submitting" && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {status === "done" && (
        <Card>
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="text-lg font-semibold">{t("doneTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("doneDesc")}</p>
            <Link href="/seat-monitor">
              <Button variant="outline" className="mt-2">{t("backToMonitor")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

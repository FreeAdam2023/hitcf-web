"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getCustomerPortal } from "@/lib/api/subscriptions";

export function PaymentFailedBanner() {
  const t = useTranslations("paymentFailed");
  const user = useAuthStore((s) => s.user);
  const sub = user?.subscription;
  const [loading, setLoading] = useState(false);

  if (!sub || sub.status !== "past_due") return null;

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      const { url } = await getCustomerPortal();
      window.location.href = url;
    } catch {
      // If no stripe customer, fall back to pricing
      window.location.href = "/pricing";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-200 animate-in slide-in-from-top duration-500">
      <AlertTriangle className="h-3.5 w-3.5" />
      <span>{t("banner")}</span>
      <button
        onClick={handleUpdatePayment}
        disabled={loading}
        className="ml-1 rounded-full bg-red-600 px-3 py-0.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : t("updatePayment")}
      </button>
    </div>
  );
}

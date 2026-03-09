"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getQuotaStatus, type QuotaStatus } from "@/lib/api/subscriptions";

export function useQuota() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);

  const refresh = useCallback(() => {
    if (!isAuthenticated) return;
    getQuotaStatus().then(setQuota).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) refresh();
  }, [isLoading, isAuthenticated, refresh]);

  return { quota, refresh };
}

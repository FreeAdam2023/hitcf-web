"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Tracks page views for authenticated users.
 * Sends page_view events to the backend on route changes.
 * Mount once in the main layout.
 */
export function PageTracker() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Skip duplicate fires for the same path
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    // Strip locale prefix for cleaner tracking (e.g. /zh/tests → /tests)
    const page = pathname.replace(/^\/(zh|en|fr|ar)/, "") || "/";
    trackEvent("page_view", { page });
  }, [pathname, isAuthenticated]);

  return null;
}

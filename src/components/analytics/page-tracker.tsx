"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Tracks page views + dwell time for authenticated users.
 * - page_view: fired on entering a page
 * - page_leave: fired on leaving (with duration_s)
 * Mount once in the main layout.
 */
export function PageTracker() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevPathRef = useRef<string | null>(null);
  const enterTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (pathname === prevPathRef.current) return;

    const page = pathname.replace(/^\/(zh|en|fr|ar)/, "") || "/";

    // Send page_leave for the previous page with duration
    if (prevPathRef.current !== null && enterTimeRef.current > 0) {
      const prevPage = prevPathRef.current.replace(/^\/(zh|en|fr|ar)/, "") || "/";
      const duration = Math.round((Date.now() - enterTimeRef.current) / 1000);
      if (duration > 0 && duration < 3600) {
        trackEvent("page_leave", { page: prevPage, duration_s: duration });
      }
    }

    prevPathRef.current = pathname;
    enterTimeRef.current = Date.now();
    trackEvent("page_view", { page });
  }, [pathname, isAuthenticated]);

  // Also fire page_leave on tab close / browser navigation
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleBeforeUnload = () => {
      if (prevPathRef.current && enterTimeRef.current > 0) {
        const page = prevPathRef.current.replace(/^\/(zh|en|fr|ar)/, "") || "/";
        const duration = Math.round((Date.now() - enterTimeRef.current) / 1000);
        if (duration > 0 && duration < 3600) {
          trackEvent("page_leave", { page, duration_s: duration });
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAuthenticated]);

  return null;
}

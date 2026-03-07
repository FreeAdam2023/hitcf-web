"use client";

import { useEffect } from "react";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export function UtmTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_PARAMS) {
      const value = params.get(key);
      if (value) {
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      }
    }
  }, []);

  return null;
}

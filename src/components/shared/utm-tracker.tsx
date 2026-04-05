"use client";

import { useEffect } from "react";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const FIRST_TOUCH_COOKIE = "hitcf_ft";
const FIRST_TOUCH_MAX_AGE = 180 * 24 * 60 * 60; // 180 days

function hasCookie(name: string): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${name}=`));
}

export function UtmTracker() {
  useEffect(() => {
    // 1. Capture UTM params into short-lived cookies (existing behavior)
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_PARAMS) {
      const value = params.get(key);
      if (value) {
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      }
    }

    // 2. First-touch attribution — write once, never overwrite.
    //    This cookie survives intra-site browsing and OAuth redirects, so
    //    ChatGPT / search referrals aren't lost to accounts.google.com or
    //    hitcf.com last-click overwrites.
    if (!hasCookie(FIRST_TOUCH_COOKIE)) {
      const ft = {
        r: document.referrer || "",
        l: window.location.href,
        t: new Date().toISOString(),
      };
      const encoded = encodeURIComponent(JSON.stringify(ft));
      document.cookie = `${FIRST_TOUCH_COOKIE}=${encoded}; path=/; max-age=${FIRST_TOUCH_MAX_AGE}; SameSite=Lax`;
    }
  }, []);

  return null;
}

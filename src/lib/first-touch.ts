/**
 * First-touch attribution cookie shared between UtmTracker (writer),
 * register page (reader, client-side), and NextAuth signIn callback
 * (reader, server-side).
 *
 * Rationale: `signup_referer` stored last-click referer only, which was
 * almost always accounts.google.com (OAuth) or hitcf.com (intra-site
 * navigation) — destroying attribution for ChatGPT / search referrals.
 * This cookie is written once on first page load and never overwritten,
 * so it survives browsing + OAuth redirects.
 */

export const FIRST_TOUCH_COOKIE = "hitcf_ft";

export interface FirstTouch {
  referer: string;
  landingUrl: string;
  at: string; // ISO timestamp
}

interface RawFirstTouch {
  r?: string;
  l?: string;
  t?: string;
}

export function parseFirstTouch(raw: string | undefined | null): FirstTouch | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as RawFirstTouch;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      referer: typeof parsed.r === "string" ? parsed.r : "",
      landingUrl: typeof parsed.l === "string" ? parsed.l : "",
      at: typeof parsed.t === "string" ? parsed.t : "",
    };
  } catch {
    return null;
  }
}

/** Read first-touch cookie on the client. Returns null if not set or unparseable. */
export function readFirstTouchFromDocument(): FirstTouch | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${FIRST_TOUCH_COOKIE}=`));
  if (!entry) return null;
  return parseFirstTouch(entry.slice(FIRST_TOUCH_COOKIE.length + 1));
}

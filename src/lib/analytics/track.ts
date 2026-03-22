/**
 * Lightweight client-side event tracking.
 * Sends events to both:
 * 1. POST /api/events/track (proxied to backend) — custom analytics
 * 2. Google Analytics 4 via gtag() — GA4 custom events
 * Fire-and-forget — never throws, never blocks UI.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, data: Record<string, unknown> = {}): void {
  try {
    // Backend tracking
    fetch("/api/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
      keepalive: true, // survives page navigation
    }).catch(() => {
      // silently ignore — tracking must never break UX
    });

    // GA4 tracking
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, data);
    }
  } catch {
    // ignore
  }
}

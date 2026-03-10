/**
 * Lightweight client-side event tracking.
 * Sends events to POST /api/events/track (proxied to backend).
 * Fire-and-forget — never throws, never blocks UI.
 */

export function trackEvent(event: string, data: Record<string, unknown> = {}): void {
  try {
    fetch("/api/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
      keepalive: true, // survives page navigation
    }).catch(() => {
      // silently ignore — tracking must never break UX
    });
  } catch {
    // ignore
  }
}

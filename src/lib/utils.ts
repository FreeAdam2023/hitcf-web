import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Parse backend datetime as UTC. Backend sends naive UTC datetimes without "Z" suffix. */
export function parseUTCms(iso: string): number {
  return new Date(iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z").getTime();
}

/** Get the latest source_date ("YYYY-MM") from a list of items. */
export function getLatestMonth(items: { source_date: string | null }[]): string | null {
  let latest: string | null = null;
  for (const item of items) {
    if (item.source_date && (!latest || item.source_date > latest)) {
      latest = item.source_date;
    }
  }
  return latest;
}

/** Extract current locale prefix from window.location, e.g. "/zh". Falls back to "/en". */
export function getLocalePath(path: string): string {
  if (typeof window === "undefined") return `/en${path}`;
  const match = window.location.pathname.match(/^\/(zh|en|fr|ar)/);
  const locale = match?.[1] || "en";
  return `/${locale}${path}`;
}

/** Check if a source_date belongs to the latest (free) month. */
export function isLatestMonth(sourceDate: string | null, latestMonth: string | null): boolean {
  if (!sourceDate || !latestMonth) return false;
  return sourceDate === latestMonth;
}

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

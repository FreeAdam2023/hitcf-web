"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

const INTERVAL_MS = 60_000; // 1 minute

/** Silent heartbeat — pings /api/user/heartbeat every 60s while authenticated. */
export function Heartbeat() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const ping = () => {
      fetch("/api/user/heartbeat", { method: "POST" }).catch(() => {});
    };

    ping(); // immediate on mount
    const timer = setInterval(ping, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  return null;
}

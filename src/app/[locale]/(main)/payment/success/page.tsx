"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Loader2, BookOpen, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { verifyPayment } from "@/lib/api/subscriptions";

type VerifyState = "verifying" | "active" | "timeout";

export default function PaymentSuccessPage() {
  const t = useTranslations();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");
  const [state, setState] = useState<VerifyState>("verifying");

  useEffect(() => {
    if (!sessionId) {
      // No session ID — legacy or direct visit, just refresh user
      fetchUser().then(() => setState("active"));
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10; // 10 × 2s = 20s max

    const poll = async () => {
      while (attempts < maxAttempts && !cancelled) {
        try {
          const res = await verifyPayment(sessionId);
          if (res.status === "active") {
            await fetchUser();
            if (!cancelled) setState("active");
            return;
          }
        } catch {
          // ignore, retry
        }
        attempts++;
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setState("timeout");
    };

    poll();
    return () => { cancelled = true; };
  }, [sessionId, fetchUser]);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-2xl">
      <Image
        src="/hero-canoe-lake.jpg"
        alt="Canadian lake"
        fill
        className="object-cover"
        priority
      />
      <div className="pointer-events-none absolute inset-0 bg-black/35" />

      <div className="relative z-10 space-y-6 px-4 text-center text-white">
        {state === "verifying" && (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-white/80" />
            <h1 className="text-2xl font-bold tracking-tight drop-shadow-lg sm:text-3xl">
              {t("payment.success.syncing")}
            </h1>
          </div>
        )}

        {state === "active" && (
          <>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg sm:text-4xl">
                {t("payment.success.title")}
              </h1>
              <p className="mx-auto max-w-md text-sm text-white/85 drop-shadow-sm">
                {t("payment.success.description")}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-white/90">
                <Link href="/tests">
                  <BookOpen className="h-4 w-4" />
                  {t("payment.success.startPractice")}
                </Link>
              </Button>
              <Button asChild size="lg" className="!bg-white/20 !text-white backdrop-blur-sm hover:!bg-white/30 border border-white/40 gap-2">
                <Link href="/account">
                  {t("payment.success.viewSubscription")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}

        {state === "timeout" && (
          <div className="space-y-3">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-300" />
            <h1 className="text-2xl font-bold tracking-tight drop-shadow-lg sm:text-3xl">
              {t("payment.success.title")}
            </h1>
            <p className="mx-auto max-w-md text-sm text-white/85 drop-shadow-sm">
              {t("payment.success.slowSync")}
            </p>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              onClick={() => window.location.reload()}
            >
              {t("payment.success.refresh")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

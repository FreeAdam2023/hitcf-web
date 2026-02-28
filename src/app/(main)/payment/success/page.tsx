"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Loader2, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export default function PaymentSuccessPage() {
  const t = useTranslations();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    fetchUser().finally(() => setRefreshed(true));
  }, [fetchUser]);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-2xl">
      {/* Full background image */}
      <Image
        src="/hero-canoe-lake.jpg"
        alt="Canadian lake"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="relative z-10 space-y-6 px-4 text-center text-white">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg sm:text-4xl">
            {t("payment.success.title")}
          </h1>
          <p className="mx-auto max-w-md text-sm text-white/85 drop-shadow-sm">
            {t("payment.success.description")}
          </p>
        </div>

        {!refreshed && (
          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("payment.success.syncing")}
          </div>
        )}

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-white/90">
            <Link href="/tests">
              <BookOpen className="h-4 w-4" />
              {t("payment.success.startPractice")}
            </Link>
          </Button>
          <Button asChild size="lg" className="!bg-white/20 !text-white backdrop-blur-sm hover:!bg-white/30 border border-white/40 gap-2">
            <Link href="/pricing">
              {t("payment.success.viewSubscription")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

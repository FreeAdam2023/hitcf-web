"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { RotateCcw, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentErrorPage() {
  const t = useTranslations();

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-2xl">
      {/* Full background image */}
      <Image
        src="/hero-aurora.jpg"
        alt="Aurora borealis"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 space-y-6 px-4 text-center text-white">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg sm:text-4xl">
            {t("payment.error.title")}
          </h1>
          <p className="mx-auto max-w-md text-sm text-white/85 drop-shadow-sm">
            {t("payment.error.description")}
          </p>
        </div>

        <a
          href="mailto:support@hitcf.com"
          className="inline-flex items-center gap-2 text-sm font-medium text-white underline underline-offset-4 drop-shadow-sm hover:text-white/80"
        >
          <Mail className="h-4 w-4" />
          support@hitcf.com
        </a>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-white/90">
            <Link href="/pricing">
              <RotateCcw className="h-4 w-4" />
              {t("payment.error.retry")}
            </Link>
          </Button>
          <Button asChild size="lg" className="!bg-white/20 !text-white backdrop-blur-sm hover:!bg-white/30 border border-white/40 gap-2">
            <Link href="/tests">
              <ArrowLeft className="h-4 w-4" />
              {t("payment.error.backToTests")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

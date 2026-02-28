"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen">
      {/* Left: landscape photo + overlay with stats (hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/login-bg.jpg"
          alt="Canadian landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link href="/tests">
            <Image src="/logo.png" alt="HiTCF" width={48} height={48} className="brightness-0 invert" />
          </Link>
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 backdrop-blur-sm px-3.5 py-1 text-sm font-medium text-white">
                {t("auth.layout.stat1")}
              </span>
              <span className="rounded-full bg-white/20 backdrop-blur-sm px-3.5 py-1 text-sm font-medium text-white">
                {t("auth.layout.stat2")}
              </span>
              <span className="rounded-full bg-white/20 backdrop-blur-sm px-3.5 py-1 text-sm font-medium text-white">
                {t("auth.layout.stat3")}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {t("auth.layout.tagline")}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
              {t("auth.layout.description1")}
              {t("auth.layout.description2")}
            </p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 lg:w-1/2">
        <Link href="/tests" className="mb-8 lg:hidden">
          <Image src="/logo.png" alt="HiTCF" width={48} height={48} />
        </Link>

        {/* Mobile trust bar */}
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground lg:hidden">
          <span>{t("auth.layout.stat1")}</span>
          <span aria-hidden="true">·</span>
          <span>{t("auth.layout.trustLine")}</span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

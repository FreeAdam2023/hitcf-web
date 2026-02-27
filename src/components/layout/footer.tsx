"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="border-t bg-card py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Left — brand + copyright */}
          <div className="space-y-1">
            <div className="text-sm font-medium">HiTCF</div>
            <div className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} HiTCF. All rights reserved.
            </div>
          </div>

          {/* Center — nav links */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/tests"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.tests')}
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.pricing')}
            </Link>
            <Link
              href="/resources"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.resources')}
            </Link>
            <a
              href="mailto:support@hitcf.com"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.contact')}
            </a>
          </div>

          {/* Right — legal links */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <Link
              href="/terms-of-service"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.terms')}
            </Link>
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="/refund-policy"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.refund')}
            </Link>
            <Link
              href="/disclaimer"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.disclaimer')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

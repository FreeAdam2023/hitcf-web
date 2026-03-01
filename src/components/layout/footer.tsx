"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const WHATSAPP_LINK = "https://chat.whatsapp.com/Fvbx6XR8EQPDSvx4VW2yn7";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
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
            <Popover>
              <PopoverTrigger asChild>
                <button className="cursor-pointer transition-colors hover:text-foreground">
                  {t('footer.contact')}
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-64 p-4">
                <p className="text-xs font-semibold mb-3">{t('footer.contact')}</p>
                <a
                  href="mailto:support@hitcf.com"
                  className="block text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                  support@hitcf.com
                </a>

                {locale === "zh" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <Image
                        src="/qr-xiaohongshu-cropped.jpg"
                        alt="Xiaohongshu QR"
                        width={100}
                        height={100}
                        className="rounded border"
                      />
                      <span className="text-[11px] text-muted-foreground">{t('footer.socialXhs')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <Image
                        src="/qr-wechat-cropped.jpg"
                        alt="WeChat QR"
                        width={100}
                        height={100}
                        className="rounded border"
                      />
                      <span className="text-[11px] text-muted-foreground">{t('footer.socialWechat')}</span>
                    </div>
                  </div>
                ) : (
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2"
                  >
                    <Image
                      src="/qr-whatsapp.png"
                      alt="WhatsApp Group QR"
                      width={160}
                      height={160}
                      className="rounded-lg border transition-transform group-hover:scale-105"
                    />
                    <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                      {t('footer.socialWhatsApp')}
                    </span>
                  </a>
                )}
              </PopoverContent>
            </Popover>
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

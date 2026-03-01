"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function CommunityFab() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Hide on immersive pages (practice/exam)
  if (pathname.startsWith("/practice/") || pathname.startsWith("/exam/")) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Popup */}
      {open && (
        <>
          {/* Backdrop — click to close */}
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="absolute bottom-11 right-0 w-64 rounded-2xl border border-border/50 bg-background/80 p-4 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                {t("community.title")}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{t("community.description")}</p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://www.xiaohongshu.com/user/profile/605439725"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-1.5"
              >
                <Image
                  src="/qr-xiaohongshu-cropped.jpg"
                  alt="Xiaohongshu QR"
                  width={108}
                  height={108}
                  className="rounded-lg border border-border/50 transition-transform group-hover:scale-105"
                />
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {t("community.followXhs")}
                </span>
              </a>
              <div className="flex flex-col items-center gap-1.5">
                <Image
                  src="/qr-wechat-cropped.jpg"
                  alt="WeChat QR"
                  width={108}
                  height={108}
                  className="rounded-lg border border-border/50"
                />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {t("community.addWechat")}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pill button — frosted glass style */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-md backdrop-blur-xl transition-all hover:text-foreground hover:shadow-lg hover:border-border active:scale-95"
      >
        {open ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <>
            <MessageCircle className="h-3.5 w-3.5" />
            {t("community.fab")}
          </>
        )}
      </button>
    </div>
  );
}

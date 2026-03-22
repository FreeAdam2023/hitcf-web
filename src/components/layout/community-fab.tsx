"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquarePlus, Users, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";

const WHATSAPP_LINK = "https://chat.whatsapp.com/Fvbx6XR8EQPDSvx4VW2yn7";

type Tab = "feedback" | "community";

export function CommunityFab() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("feedback");
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  // Hide on immersive pages (practice/exam)
  if (pathname.startsWith("/practice/") || pathname.startsWith("/exam/")) {
    return null;
  }

  const handleFeedbackClick = () => {
    setOpen(false);
    setFeedbackDialogOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-5 end-5 z-50 hidden md:block" data-feedback-exclude>
        {/* Popup */}
        {open && (
          <>
            {/* Backdrop — click to close */}
            <div className="fixed inset-0" onClick={() => setOpen(false)} />
            <div className="absolute bottom-14 end-0 w-72 rounded-2xl border border-border/50 bg-background/95 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Tab header */}
              <div className="flex border-b border-border/50">
                <button
                  onClick={() => setTab("feedback")}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                    tab === "feedback"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageSquarePlus className="h-3.5 w-3.5 inline-block me-1.5 -mt-0.5" />
                  {t("feedback.title")}
                </button>
                <button
                  onClick={() => setTab("community")}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                    tab === "community"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="h-3.5 w-3.5 inline-block me-1.5 -mt-0.5" />
                  {t("community.title")}
                </button>
              </div>

              <div className="p-4">
                {tab === "feedback" ? (
                  /* Feedback tab — quick entry to open full dialog */
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t("feedback.description")}
                    </p>
                    <button
                      onClick={handleFeedbackClick}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98]"
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      {t("feedback.openForm")}
                    </button>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {(["bug", "feature", "content", "other"] as const).map(
                        (cat) => (
                          <span
                            key={cat}
                            className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {t(`feedback.${cat}`)}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  /* Community tab */
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t("community.description")}
                    </p>
                    {locale === "zh" ? (
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
                          className="rounded-lg border border-border/50 transition-transform group-hover:scale-105"
                        />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          {t("community.joinWhatsApp")}
                        </span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* FAB button — feedback-first, more prominent on mobile */}
        <button
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              setTab("feedback");
              setOpen(true);
            }
          }}
          className={`flex items-center gap-1.5 rounded-full shadow-lg transition-all active:scale-95 ${
            open
              ? "px-3 py-2.5 border border-border/50 bg-background/80 text-muted-foreground backdrop-blur-xl hover:text-foreground"
              : "px-4 py-3 md:py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 text-base md:text-sm"
          }`}
        >
          {open ? (
            <X className="h-4 w-4" />
          ) : (
            <>
              <MessageSquarePlus className="h-5 w-5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{t("feedback.fab")}</span>
            </>
          )}
        </button>
      </div>

      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
      />
    </>
  );
}

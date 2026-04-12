"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SharePoster, type SharePosterProps } from "./share-poster";
import { useTranslations } from "next-intl";

interface ShareDialogProps extends SharePosterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  ...posterProps
}: ShareDialogProps) {
  const t = useTranslations("results.share");
  const posterRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Reset + trigger flip animation whenever the dialog opens
  useEffect(() => {
    if (!open) {
      setFlipped(false);
      return;
    }
    setFlipped(false);
    const t = setTimeout(() => setFlipped(true), 50);
    return () => clearTimeout(t);
  }, [open]);

  const handleSave = async () => {
    if (!posterRef.current) return;
    setSaving(true);
    setSaved(false);
    try {
      const dataUrl = await toPng(posterRef.current, {
        width: 1080,
        height: 1440,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      link.download = `hitcf-${posterProps.testSetType}-score.png`;
      link.href = dataUrl;
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        {/* Poster preview — scaled to fit dialog width, maintaining 3:4 ratio */}
        <div
          className="relative w-full"
          style={{ aspectRatio: "3 / 4", perspective: "1200px" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              borderRadius: "0.5rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--muted))",
              transform: flipped ? "rotateY(720deg) scale(1)" : "rotateY(0deg) scale(0.3)",
              opacity: flipped ? 1 : 0,
              transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                width: 1080,
                height: 1440,
                transform: "scale(var(--s))",
                transformOrigin: "top left",
              }}
              ref={(el) => {
                if (el) {
                  const parent = el.parentElement;
                  if (parent) {
                    const s = parent.clientWidth / 1080;
                    el.style.setProperty("--s", String(s));
                  }
                }
              }}
            >
              <SharePoster ref={posterRef} {...posterProps} />
            </div>
          </div>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t("saved")}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {t("save")}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

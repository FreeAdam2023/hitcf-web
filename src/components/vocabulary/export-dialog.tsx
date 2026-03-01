"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ExportLimitError } from "@/lib/api/vocabulary";
import { AnkiCardPreview } from "@/components/vocabulary/anki-card-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExportDialogProps {
  wordCount: number;
  onExport: () => Promise<void>;
}

export function ExportDialog({ wordCount, onExport }: ExportDialogProps) {
  const t = useTranslations();
  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await onExport();
      setOpen(false);
    } catch (e) {
      if (e instanceof ExportLimitError) {
        if (e.status === 429) {
          setError(t("vocabulary.export.errorRateLimit"));
        } else if (e.status === 403) {
          setError(t("vocabulary.export.errorWordLimit"));
        } else if (e.status === 401) {
          setError(t("vocabulary.export.errorLogin"));
        } else {
          setError(t("vocabulary.export.errorGeneric"));
        }
      } else {
        setError(t("vocabulary.export.errorGeneric"));
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-4 w-4" />
          {t("vocabulary.export.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("vocabulary.export.title")}</DialogTitle>
          <DialogDescription>
            {t("vocabulary.export.description", { count: wordCount })}
          </DialogDescription>
        </DialogHeader>
        <div className="my-1">
          <p className="font-medium">{t("vocabulary.export.ankiTitle")}</p>
          <p className="text-sm text-muted-foreground mb-2">{t("vocabulary.export.ankiDesc")}</p>
          <AnkiCardPreview />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button onClick={handleExport} disabled={exporting} className="w-full">
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {exporting ? t("vocabulary.export.exporting") : t("vocabulary.export.downloadButton")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

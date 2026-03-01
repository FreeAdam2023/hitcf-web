"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
      setOpen(false);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <div className="rounded-lg border p-3 my-2">
          <p className="font-medium">{t("vocabulary.export.ankiTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("vocabulary.export.ankiDesc")}</p>
        </div>
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

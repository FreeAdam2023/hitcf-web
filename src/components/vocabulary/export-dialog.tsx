"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Info, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ExportLimitError,
  startNihaoExport,
  startThemeExport,
  startSavedExport,
  getExportStatus,
  downloadExportFile,
} from "@/lib/api/vocabulary";
import type { ExportStatus } from "@/lib/api/vocabulary";
import { AnkiCardPreview } from "@/components/vocabulary/anki-card-preview";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ExportType = "nihao" | "saved" | "theme";

interface ExportDialogProps {
  wordCount: number;
  exportType: ExportType;
  exportParams: Record<string, string | number | undefined>;
}

const HUMOR_COUNT = 8;
const HUMOR_ROTATE_MS = 5000;
const POLL_INTERVAL_MS = 3000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ExportDialog({ wordCount, exportType, exportParams }: ExportDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "generating" | "building" | "downloading">("idle");
  const [progress, setProgress] = useState({ total: 0, completed: 0 });
  const [humorIndex, setHumorIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  // Rotate humor messages while generating
  useEffect(() => {
    if (phase !== "generating") return;
    const id = setInterval(() => {
      setHumorIndex((prev) => (prev + 1) % HUMOR_COUNT);
    }, HUMOR_ROTATE_MS);
    return () => clearInterval(id);
  }, [phase]);

  // Warn user before closing/refreshing during export
  useEffect(() => {
    if (phase === "idle") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  const handleExport = useCallback(async () => {
    setPhase("generating");
    setError(null);
    setProgress({ total: 0, completed: 0 });
    setHumorIndex(0);
    cancelledRef.current = false;

    try {
      // 1. Start job
      let jobId: string;
      if (exportType === "nihao") {
        const { level, lesson, theme } = exportParams;
        const res = await startNihaoExport(
          level as string | undefined,
          lesson != null ? Number(lesson) : undefined,
          theme as string | undefined,
        );
        jobId = res.job_id;
      } else if (exportType === "theme") {
        const res = await startThemeExport(
          exportParams.tag as string | undefined,
          exportParams.tag_category as string | undefined,
        );
        jobId = res.job_id;
      } else {
        const res = await startSavedExport(exportParams.source_type as string | undefined);
        jobId = res.job_id;
      }

      // 2. Poll until ready or failed
      let status: ExportStatus;
      do {
        await sleep(POLL_INTERVAL_MS);
        if (cancelledRef.current) return;
        status = await getExportStatus(exportType, jobId);
        setProgress({ total: status.total, completed: status.completed });

        if (status.status === "generating_cards") setPhase("generating");
        else if (status.status === "building_deck") setPhase("building");
      } while (status.status !== "ready" && status.status !== "failed");

      if (status.status === "failed") {
        throw new Error(status.error || "Export failed");
      }

      // 3. Download
      setPhase("downloading");
      await downloadExportFile(exportType, jobId);
      setOpen(false);
    } catch (e) {
      if (cancelledRef.current) return;
      if (e instanceof ExportLimitError) {
        if (e.status === 429) setError(t("vocabulary.export.errorRateLimit"));
        else if (e.status === 403) setError(t("vocabulary.export.errorWordLimit"));
        else if (e.status === 401) setError(t("vocabulary.export.errorLogin"));
        else setError(t("vocabulary.export.errorGeneric"));
      } else {
        setError(t("vocabulary.export.errorGeneric"));
      }
    } finally {
      if (!cancelledRef.current) {
        setPhase("idle");
      }
    }
  }, [exportType, exportParams, t]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      cancelledRef.current = true;
      setError(null);
      setPhase("idle");
    }
  };

  const isWorking = phase !== "idle";
  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  const humorKey = `vocabulary.export.humor${humorIndex}` as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        {/* Preview (hidden while working) */}
        {!isWorking && (
          <div className="my-1">
            <p className="font-medium">{t("vocabulary.export.ankiTitle")}</p>
            <p className="text-sm text-muted-foreground mb-2">{t("vocabulary.export.ankiDesc")}</p>
            <AnkiCardPreview />
            {/* Platform pricing tip */}
            <div className="mt-3 flex gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                {t("vocabulary.export.platformTip")}{" "}
                <a
                  href={t("vocabulary.export.platformTipUrl")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  {t("vocabulary.export.platformTipLink")} &rsaquo;
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Generating cards phase */}
        {phase === "generating" && (
          <div className="space-y-3 py-2">
            <Progress value={pct} className="h-2.5" />
            <p className="text-sm text-muted-foreground text-center">
              {t(humorKey)}
            </p>
            {progress.total > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {progress.completed}/{progress.total} {t("vocabulary.export.cardsReady")}
              </p>
            )}
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              {t("vocabulary.export.doNotClose")}
            </p>
          </div>
        )}

        {/* Building deck phase */}
        {phase === "building" && (
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {t("vocabulary.export.buildingDeck")}
              </p>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              {t("vocabulary.export.doNotClose")}
            </p>
          </div>
        )}

        {/* Downloading phase */}
        {phase === "downloading" && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("vocabulary.export.exporting")}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button onClick={handleExport} disabled={isWorking} className="w-full">
          {isWorking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isWorking ? t("vocabulary.export.exporting") : t("vocabulary.export.downloadButton")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

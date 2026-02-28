"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-950/20">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <p className="text-sm text-muted-foreground">{message ?? t('common.errors.generic')}</p>
      {onRetry && (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          {t('common.actions.retry')}
        </Button>
      )}
    </div>
  );
}

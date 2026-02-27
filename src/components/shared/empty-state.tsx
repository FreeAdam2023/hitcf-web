"use client";

import { Inbox } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
        <Inbox className="h-8 w-8 text-primary/40" />
      </div>
      <h3 className="text-lg font-medium">{title ?? t('common.empty.title')}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description ?? t('common.empty.description')}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

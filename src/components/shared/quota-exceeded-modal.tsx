"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuotaExceededModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "question" | "explanation";
  used: number;
  limit: number;
}

export function QuotaExceededModal({
  open,
  onOpenChange,
  type,
  used,
  limit,
}: QuotaExceededModalProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            {t("quota.exceeded.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              {type === "question"
                ? t("quota.exceeded.questionMessage", { used, limit })
                : t("quota.exceeded.explanationMessage", { used, limit })}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t("quota.exceeded.resetHint")}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("quota.exceeded.continueFree")}</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push("/pricing")}>
            {t("quota.exceeded.upgradePro")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

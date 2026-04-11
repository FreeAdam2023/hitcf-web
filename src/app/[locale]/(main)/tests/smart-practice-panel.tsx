"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startSmartPractice } from "@/lib/api/smart-practice";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  type: "listening" | "reading";
}

export function SmartPracticePanel({ type }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [starting, setStarting] = useState<number | null>(null);

  const handleStart = async (size: number) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setStarting(size);
    try {
      const res = await startSmartPractice({ type, size });
      router.push(`/practice/${res.attempt_id}`);
    } catch {
      toast.error(t("common.errors.generic"));
      setStarting(null);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-purple-500/5 p-5 dark:border-violet-500/30">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">{t("smartPractice.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("smartPractice.subtitle")}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 ml-auto">
          <Button
            onClick={() => handleStart(10)}
            disabled={starting !== null}
            className="bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 h-10 px-5 text-sm font-semibold"
          >
            {starting === 10 ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-1.5 h-4 w-4" />
            )}
            {t("smartPractice.quick")}
          </Button>
          <button
            type="button"
            onClick={() => handleStart(39)}
            disabled={starting !== null}
            className="text-xs text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 underline-offset-2 hover:underline transition-colors disabled:opacity-50"
          >
            {starting === 39 ? (
              <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
            ) : null}
            {t("smartPractice.fullLink")}
          </button>
        </div>
      </div>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Headphones, BookOpen, Mic, PenTool, BookMarked, BarChart3, Sparkles, Loader2 } from "lucide-react";
import { PRICING } from "@/lib/constants";
import { activateTrial } from "@/lib/api/trial";

const FEATURES = [
  { icon: Headphones, key: "listening" },
  { icon: BookOpen, key: "reading" },
  { icon: Mic, key: "speaking" },
  { icon: PenTool, key: "writing" },
  { icon: BookMarked, key: "vocabulary" },
  { icon: BarChart3, key: "analytics" },
] as const;

export default function WelcomePage() {
  const t = useTranslations("welcome");
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!user) return null;

  const name = user.name || user.email.split("@")[0];

  const handleActivate = async () => {
    setActivating(true);
    try {
      await activateTrial();
      await fetchUser(); // refresh subscription state
      router.push("/tests");
    } catch {
      // Fallback: go to tests even if activation fails
      router.push("/tests");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Celebration */}
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title", { name })}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("subtitleChoice", { days: PRICING.reverseTrialDays })}
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {FEATURES.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
              <div>
                <p className="text-sm font-medium">{t(`features.${key}`)}</p>
                <p className="text-xs text-muted-foreground">{t(`featuresDesc.${key}`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            size="lg"
            onClick={handleActivate}
            disabled={activating}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-base font-semibold shadow-lg hover:from-indigo-600 hover:to-violet-600"
          >
            {activating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("activating")}</>
            ) : (
              t("cta")
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("hint", { days: PRICING.reverseTrialDays })}
          </p>
          <Link
            href="/tests"
            className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("skip")}
          </Link>
        </div>
      </div>
    </div>
  );
}

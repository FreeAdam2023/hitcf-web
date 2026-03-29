"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Headphones, BookOpen, Mic, PenTool, BookMarked, BarChart3, Sparkles } from "lucide-react";
import { PRICING } from "@/lib/constants";

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
  const { user, isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated && !useAuthStore.getState().isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  const name = user.name || user.email.split("@")[0];

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
            {t("subtitle", { days: PRICING.reverseTrialDays })}
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
          <Link href="/tests">
            <Button size="lg" className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-base font-semibold shadow-lg hover:from-indigo-600 hover:to-violet-600">
              {t("cta")}
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            {t("hint", { days: PRICING.reverseTrialDays })}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile, changePassword } from "@/lib/api/auth";
import { getStatsOverview, type StatsOverview } from "@/lib/api/stats";
import { ApiError } from "@/lib/api/client";
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/locales";
import { PRICING } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Sparkles,
  LogOut,
  Crown,
  BookOpen,
  ArrowRight,
  BarChart3,
  Globe,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";

const QUOTE_FR = [
  "Petit à petit, l'oiseau fait son nid.",
  "C'est en forgeant qu'on devient forgeron.",
  "Vouloir, c'est pouvoir.",
  "Rome ne s'est pas faite en un jour.",
  "Qui ne tente rien n'a rien.",
  "À cœur vaillant rien d'impossible.",
  "Les petits ruisseaux font les grandes rivières.",
  "Après la pluie, le beau temps.",
  "Qui vivra verra.",
  "La nuit porte conseil.",
  "Mieux vaut tard que jamais.",
  "La persévérance est la noblesse de l'obstination.",
  "L'avenir appartient à ceux qui se lèvent tôt.",
  "Chaque langue nouvelle est une nouvelle fenêtre sur le monde.",
];

function formatDate(dateStr: string | null | undefined, locale = "zh"): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const loc = locale === "zh" ? "zh-CN" : "en-US";
  return d.toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AccountView() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const locale = (user?.ui_language || "zh") as Locale;

  // Stats
  const [stats, setStats] = useState<StatsOverview | null>(null);

  // Profile editing
  const [name, setName] = useState("");
  const [nameInitialized, setNameInitialized] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Language
  const [langSaving, setLangSaving] = useState(false);


  const quoteIndex = useMemo(
    () => Math.floor(Math.random() * QUOTE_FR.length),
    []
  );

  const loadStats = useCallback(() => {
    getStatsOverview().then(setStats).catch(() => setStats(null));
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadStats();
  }, [isAuthenticated, loadStats]);

  // Initialize name from user data
  if (user && !nameInitialized) {
    setName(user.name || "");
    setNameInitialized(true);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4 pt-8">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push("/login");
    return null;
  }

  const isSubscribed = hasActiveSubscription();
  const subStatus = user.subscription?.status;
  const subPlan = user.subscription?.plan;
  const planLabel =
    subPlan === "tester"
      ? t("account.subscription.tester")
      : subPlan === "reverse_trial"
        ? t("account.subscription.reverseTrial")
        : subPlan === "monthly"
          ? t("account.subscription.monthly")
          : subPlan === "quarterly"
            ? t("account.subscription.quarterly")
            : subPlan === "semiannual"
              ? t("account.subscription.semiannual")
              : subPlan || "";

  const firstName = user.name?.split(/\s/)[0] || t("account.defaultName");

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) return;
    setNameSaving(true);
    setNameError("");
    setNameSuccess(false);
    try {
      await updateProfile({ name: trimmed });
      await fetchUser();
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2000);
    } catch (err) {
      setNameError(err instanceof ApiError ? err.message : t("account.saveFailed"));
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword.length < 8) {
      setPasswordError(t("account.passwordMinLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("account.passwordMismatch"));
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : t("account.passwordChangeFailed"));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pt-8">
      {/* ── Hero Card ── */}
      {isSubscribed && subPlan !== "reverse_trial" && subStatus !== "trialing" ? (
        /* ─── Paid Pro Member Hero ─── */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-semibold tracking-wide text-amber-400">
                PRO{planLabel ? ` · ${planLabel}` : ""}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white">
              {t("account.heroGreetingPro", { name: firstName })}
            </h1>
            {user.subscription?.current_period_end && (
              <p className="mt-1 text-xs text-white/50">
                {t("account.subscription.expiresDate", { date: formatDate(user.subscription.current_period_end, locale) })}
              </p>
            )}
          </div>

          <div className="relative mt-6 border-t border-white/10 pt-4">
            <p className="text-sm italic text-white/40">
              &ldquo;{QUOTE_FR[quoteIndex]}&rdquo;
            </p>
            <p className="mt-1 text-xs text-white/30">{t(`account.quotes.${quoteIndex}`)}</p>
          </div>

          <div className="relative mt-4 flex gap-2">
            <Link href="/history">
              <Button size="sm" variant="ghost" className="text-white/60 hover:bg-white/10 hover:text-white">
                <BarChart3 className="mr-1 h-4 w-4" />
                {t("account.stats.title")}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
            <Link href="/tests">
              <Button size="sm" variant="ghost" className="text-white/60 hover:bg-white/10 hover:text-white">
                <BookOpen className="mr-1 h-4 w-4" />
                {t("account.continuePractice")}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* ─── Free / Trial User Hero ─── */
        <div className={`relative overflow-hidden rounded-2xl p-6 ${
          subPlan === "reverse_trial" || subStatus === "trialing"
            ? "border-2 border-indigo-200 bg-white shadow-xl dark:border-indigo-800 dark:bg-slate-900"
            : "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0f1729] dark:to-[#162036] dark:border dark:border-slate-700/40 dark:shadow-2xl dark:shadow-indigo-500/5"
        }`}>
          <div>
            {(subPlan === "reverse_trial" || subStatus === "trialing") && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <Sparkles className="h-3 w-3" />
                {t("account.subscription.reverseTrial")}
                {user.subscription?.current_period_end && (
                  <span className="text-indigo-500 dark:text-indigo-400">
                    · {t("account.subscription.expiresDate", { date: formatDate(user.subscription.current_period_end, locale) })}
                  </span>
                )}
              </div>
            )}
            <h1 className="text-2xl font-bold">{t("account.heroGreetingFree", { name: firstName })}</h1>
            <blockquote className="mt-3 border-l-4 border-primary/40 pl-4">
              <p className="text-sm italic text-muted-foreground">
                {QUOTE_FR[quoteIndex]}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t(`account.quotes.${quoteIndex}`)}</p>
            </blockquote>
          </div>

          {/* Stats summary */}
          {stats && stats.total_attempts > 0 && (
            <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">
                  {stats.total_attempts}
                </strong>{" "}
                {t("account.stats.practices")}
              </span>
              <span>
                <strong className="text-foreground">
                  {stats.total_questions_answered}
                </strong>{" "}
                {t("account.stats.questionsCount")}
              </span>
              {stats.accuracy_rate > 0 && (
                <span>
                  {t("account.stats.accuracy")}{" "}
                  <strong className="text-foreground">
                    {Math.round(stats.accuracy_rate)}%
                  </strong>
                </span>
              )}
            </div>
          )}

          {/* Upgrade CTA */}
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-500/10 dark:to-orange-500/8 dark:border dark:border-amber-500/20 dark:shadow-lg dark:shadow-amber-500/5">
            <Sparkles className="h-8 w-8 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {t("account.unlockAll")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("account.semiannualDeal", {
                  semiannualPrice: PRICING.semiannual.toFixed(2),
                  semiannualPerMonth: PRICING.semiannualPerMonth.toFixed(2),
                  semiannualTrialDays: String(PRICING.semiannualTrialDays),
                })}
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-amber-500 hover:bg-amber-600"
              onClick={() => router.push("/pricing")}
            >
              {t("account.upgradePro")}
            </Button>
          </div>
        </div>
      )}

      {/* ── Profile Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.profile.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("account.profile.email")}
            </label>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("account.profile.name")}
            </label>
            <div className="mt-1 flex gap-2">
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameSuccess(false);
                  setNameError("");
                }}
                placeholder={t("account.profile.namePlaceholder")}
                maxLength={100}
                className="max-w-xs"
              />
              <Button
                size="sm"
                onClick={handleSaveName}
                disabled={
                  nameSaving || !name.trim() || name.trim() === user.name
                }
              >
                {nameSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : nameSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  t("common.actions.save")
                )}
              </Button>
            </div>
            {nameError && (
              <p className="mt-1 text-sm text-destructive">{nameError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("account.profile.password")}
            </label>
            <div className="mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setPasswordError("");
                  setPasswordSuccess(false);
                }}
              >
                {showPasswordForm ? (
                  <ChevronUp className="mr-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="mr-1 h-4 w-4" />
                )}
                {t("account.profile.changePassword")}
              </Button>
            </div>

            {showPasswordForm && (
              <div className="mt-3 space-y-3 rounded-lg border p-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("account.profile.currentPassword")}
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className="mt-1 max-w-xs"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("account.profile.newPassword")}
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder={t("account.profile.newPasswordPlaceholder")}
                    className="mt-1 max-w-xs"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("account.profile.confirmPassword")}
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className="mt-1 max-w-xs"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-600">{t("account.profile.passwordChanged")}</p>
                )}
                <Button
                  size="sm"
                  onClick={handleChangePassword}
                  disabled={
                    passwordSaving ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {passwordSaving ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("account.profile.confirmChange")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Language Selector Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("account.language.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            {t("account.language.description")}
          </p>
          <div className="flex gap-2">
            {SUPPORTED_LOCALES.map((loc) => (
              <Button
                key={loc}
                size="sm"
                variant={locale === loc ? "default" : "outline"}
                disabled={langSaving}
                onClick={async () => {
                  if (loc === locale) return;
                  setLangSaving(true);
                  try {
                    await updateProfile({ ui_language: loc });
                    await fetchUser();
                  } finally {
                    setLangSaving(false);
                  }
                }}
              >
                {langSaving && locale !== loc ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : locale === loc ? (
                  <Check className="mr-1 h-3 w-3" />
                ) : null}
                {LOCALE_LABELS[loc]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Theme Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {resolvedTheme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {t("account.theme.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={theme === mode ? "default" : "outline"}
                onClick={() => setTheme(mode)}
              >
                {mode === "light" && <Sun className="mr-1 h-3 w-3" />}
                {mode === "dark" && <Moon className="mr-1 h-3 w-3" />}
                {mode === "system" && <Monitor className="mr-1 h-3 w-3" />}
                {t(`account.theme.${mode}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Account Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.accountCard.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {t("account.accountCard.registeredAt", { date: formatDate(user.created_at, locale) })}
            </div>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="mr-1 h-4 w-4" />
              {t("account.accountCard.logout")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

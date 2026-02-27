"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile, changePassword } from "@/lib/api/auth";
import { getCustomerPortal } from "@/lib/api/subscriptions";
import { getStatsOverview, type StatsOverview } from "@/lib/api/stats";
import { ApiError } from "@/lib/api/client";
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
  ExternalLink,
  Sparkles,
  LogOut,
  Crown,
  Target,
  Flame,
  BookOpen,
  Headphones,
  BookOpenText,
  ArrowRight,
  BarChart3,
} from "lucide-react";

const QUOTES = [
  { fr: "Petit à petit, l'oiseau fait son nid.", zh: "一点一点，鸟儿筑成了巢。——积少成多，功到自成。" },
  { fr: "C'est en forgeant qu'on devient forgeron.", zh: "打铁才能成铁匠。——熟能生巧。" },
  { fr: "Vouloir, c'est pouvoir.", zh: "有志者，事竟成。" },
  { fr: "Rome ne s'est pas faite en un jour.", zh: "罗马不是一天建成的。" },
  { fr: "Qui ne tente rien n'a rien.", zh: "不尝试就什么也得不到。" },
  { fr: "À cœur vaillant rien d'impossible.", zh: "勇者无难事。" },
  { fr: "Les petits ruisseaux font les grandes rivières.", zh: "涓涓细流汇成大河。——积少成多。" },
  { fr: "Après la pluie, le beau temps.", zh: "雨过天晴。——困难之后必有好日子。" },
  { fr: "Qui vivra verra.", zh: "活着就能看到。——走着瞧，未来可期。" },
  { fr: "La nuit porte conseil.", zh: "夜晚会带来好主意。——一觉醒来就有办法了。" },
  { fr: "Mieux vaut tard que jamais.", zh: "迟做总比不做好。" },
  { fr: "La persévérance est la noblesse de l'obstination.", zh: "坚持是执着最高贵的形式。——Adrien Decourcelle" },
  { fr: "L'avenir appartient à ceux qui se lèvent tôt.", zh: "未来属于早起的人。" },
  { fr: "Chaque langue nouvelle est une nouvelle fenêtre sur le monde.", zh: "每学一门新语言，就多了一扇看世界的窗。" },
];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatCell({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className={`h-5 w-5 ${accent || "text-white/70"}`} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function AccuracyRing({
  value,
  label,
  size = 72,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={4}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ring-gradient)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

export function AccountView() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

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

  // Subscription management
  const [portalLoading, setPortalLoading] = useState(false);

  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
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
    subPlan === "monthly"
      ? "月付"
      : subPlan === "quarterly"
        ? "季付"
        : subPlan === "yearly"
          ? "年付"
          : subPlan || "";

  const firstName = user.name?.split(/\s/)[0] || "同学";

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
      setNameError(err instanceof ApiError ? err.message : "保存失败");
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword.length < 8) {
      setPasswordError("新密码至少需要 8 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("两次输入的新密码不一致");
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
      setPasswordError(err instanceof ApiError ? err.message : "修改失败");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { url } = await getCustomerPortal();
      window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pt-8">
      {/* ── Hero Card ── */}
      {isSubscribed ? (
        /* ─── Pro Member Hero ─── */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

          {/* Header */}
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-semibold tracking-wide text-amber-400">
                  PRO{" "}
                  {subStatus === "trialing"
                    ? "试用中"
                    : planLabel
                      ? `· ${planLabel}`
                      : "会员"}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-white">
                Bonjour, {firstName}
              </h1>
              {subStatus === "trialing" && user.subscription?.trial_end && (
                <p className="mt-1 text-xs text-white/50">
                  试用至 {formatDate(user.subscription.trial_end)}
                </p>
              )}
              {subStatus === "active" &&
                user.subscription?.current_period_end && (
                  <p className="mt-1 text-xs text-white/50">
                    续费日 {formatDate(user.subscription.current_period_end)}
                  </p>
                )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:bg-white/10 hover:text-white"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">管理订阅</span>
            </Button>
          </div>

          {/* Stats Row */}
          {stats && (
            <div className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCell
                icon={BookOpen}
                value={stats.total_attempts}
                label="练习次数"
              />
              <StatCell
                icon={Target}
                value={
                  stats.accuracy_rate > 0
                    ? `${Math.round(stats.accuracy_rate)}%`
                    : "-"
                }
                label="总正确率"
              />
              <StatCell
                icon={Flame}
                value={stats.streak_days}
                label="连续天数"
                accent="text-orange-400"
              />
              <StatCell
                icon={BarChart3}
                value={stats.total_questions_answered}
                label="做题总数"
              />
            </div>
          )}

          {/* Accuracy Rings */}
          {stats &&
            (stats.listening_accuracy > 0 || stats.reading_accuracy > 0) && (
              <div className="relative mt-6 flex items-center justify-center gap-8 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-white/40" />
                  <AccuracyRing
                    value={stats.listening_accuracy}
                    label="听力正确率"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <BookOpenText className="h-4 w-4 text-white/40" />
                  <AccuracyRing
                    value={stats.reading_accuracy}
                    label="阅读正确率"
                  />
                </div>
              </div>
            )}

          {/* Quote */}
          <div className="relative mt-6 border-t border-white/10 pt-4">
            <p className="text-sm italic text-white/40">
              &ldquo;{quote.fr}&rdquo;
            </p>
            <p className="mt-1 text-xs text-white/30">{quote.zh}</p>
          </div>

          {/* Quick link */}
          <div className="relative mt-4 flex gap-2">
            <Link href="/dashboard">
              <Button
                size="sm"
                variant="ghost"
                className="text-white/60 hover:bg-white/10 hover:text-white"
              >
                <BarChart3 className="mr-1 h-4 w-4" />
                学习统计
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
            <Link href="/tests">
              <Button
                size="sm"
                variant="ghost"
                className="text-white/60 hover:bg-white/10 hover:text-white"
              >
                <BookOpen className="mr-1 h-4 w-4" />
                继续练习
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* ─── Free User Hero ─── */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-800">
          <div>
            <h1 className="text-2xl font-bold">Salut {firstName},</h1>
            <blockquote className="mt-3 border-l-4 border-primary/40 pl-4">
              <p className="text-sm italic text-muted-foreground">
                {quote.fr}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{quote.zh}</p>
            </blockquote>
          </div>

          {/* Stats summary for free user */}
          {stats && stats.total_attempts > 0 && (
            <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">
                  {stats.total_attempts}
                </strong>{" "}
                次练习
              </span>
              <span>
                <strong className="text-foreground">
                  {stats.total_questions_answered}
                </strong>{" "}
                道题
              </span>
              {stats.accuracy_rate > 0 && (
                <span>
                  正确率{" "}
                  <strong className="text-foreground">
                    {Math.round(stats.accuracy_rate)}%
                  </strong>
                </span>
              )}
            </div>
          )}

          {/* Upgrade CTA */}
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-950/30 dark:to-orange-950/30">
            <Sparkles className="h-8 w-8 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                解锁全部 8,500+ 道真题 + 考试模式
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                年付低至 $6.66/月，含 2 个月免费试用
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-amber-500 hover:bg-amber-600"
              onClick={() => router.push("/pricing")}
            >
              升级 Pro
            </Button>
          </div>
        </div>
      )}

      {/* ── Profile Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              邮箱
            </label>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              姓名
            </label>
            <div className="mt-1 flex gap-2">
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameSuccess(false);
                  setNameError("");
                }}
                placeholder="输入姓名"
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
                  "保存"
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
              密码
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
                修改密码
              </Button>
            </div>

            {showPasswordForm && (
              <div className="mt-3 space-y-3 rounded-lg border p-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    当前密码
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
                    新密码
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="至少 8 位"
                    className="mt-1 max-w-xs"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    确认新密码
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
                  <p className="text-sm text-green-600">密码修改成功</p>
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
                  确认修改
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Account Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>账号</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              注册时间：{formatDate(user.created_at)}
            </div>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="mr-1 h-4 w-4" />
              退出登录
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

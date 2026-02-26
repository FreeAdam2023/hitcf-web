"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile, changePassword } from "@/lib/api/auth";
import { getCustomerPortal } from "@/lib/api/subscriptions";
import { ApiError } from "@/lib/api/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  ExternalLink,
  Sparkles,
  LogOut,
} from "lucide-react";

const QUOTES = [
  // 法语谚语
  { fr: "Petit à petit, l'oiseau fait son nid.", zh: "一点一点，鸟儿筑成了巢。——积少成多，功到自成。" },
  { fr: "C'est en forgeant qu'on devient forgeron.", zh: "打铁才能成铁匠。——熟能生巧。" },
  { fr: "Vouloir, c'est pouvoir.", zh: "有志者，事竟成。" },
  { fr: "Rome ne s'est pas faite en un jour.", zh: "罗马不是一天建成的。" },
  { fr: "Qui ne tente rien n'a rien.", zh: "不尝试就什么也得不到。" },
  { fr: "À cœur vaillant rien d'impossible.", zh: "勇者无难事。" },
  { fr: "Les petits ruisseaux font les grandes rivières.", zh: "涓涓细流汇成大河。——积少成多。" },
  { fr: "Il faut tourner sept fois sa langue dans sa bouche avant de parler.", zh: "开口之前要三思。——说话前先想清楚。" },
  { fr: "Après la pluie, le beau temps.", zh: "雨过天晴。——困难之后必有好日子。" },
  { fr: "Qui vivra verra.", zh: "活着就能看到。——走着瞧，未来可期。" },
  { fr: "La nuit porte conseil.", zh: "夜晚会带来好主意。——一觉醒来就有办法了。" },
  { fr: "Mieux vaut tard que jamais.", zh: "迟做总比不做好。" },
  // 法国名人名言
  { fr: "Le savoir est la seule matière qui s'accroît quand on la partage.", zh: "知识是唯一越分享越多的东西。——Socrate" },
  { fr: "La persévérance est la noblesse de l'obstination.", zh: "坚持是执着最高贵的形式。——Adrien Decourcelle" },
  { fr: "Il n'y a qu'une façon d'échouer, c'est d'abandonner avant d'avoir réussi.", zh: "失败只有一种方式：在成功之前放弃。——Georges Clemenceau" },
  { fr: "Ce qui compte, ce n'est pas le nombre d'heures que vous consacrez, c'est ce que vous consacrez à ces heures.", zh: "重要的不是你花了多少小时，而是你在这些小时里投入了什么。" },
  { fr: "L'avenir appartient à ceux qui se lèvent tôt.", zh: "未来属于早起的人。——法语谚语" },
  { fr: "La lecture est à l'esprit ce que l'exercice est au corps.", zh: "阅读之于心灵，犹如运动之于身体。——Addison" },
  { fr: "On ne naît pas savant, on le devient.", zh: "没有人生来博学，都是学出来的。" },
  { fr: "Chaque langue nouvelle est une nouvelle fenêtre sur le monde.", zh: "每学一门新语言，就多了一扇看世界的窗。" },
];

function SubscriptionBadge({ status }: { status: string | null }) {
  if (status === "active") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        Pro 会员
      </Badge>
    );
  }
  if (status === "trialing") {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        试用中
      </Badge>
    );
  }
  return <Badge variant="secondary">免费用户</Badge>;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AccountView() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

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

  // Initialize name from user data
  if (user && !nameInitialized) {
    setName(user.name || "");
    setNameInitialized(true);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4 pt-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
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

  const planLabel = subPlan === "monthly" ? "月付" : subPlan === "semi_annual" ? "半年付" : subPlan === "yearly" ? "年付" : subPlan || "";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const firstName = user.name?.split(/\s/)[0] || "同学";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pt-8">
      <div>
        <h1 className="text-2xl font-bold">Salut {firstName},</h1>
        <blockquote className="mt-3 border-l-4 border-primary/40 pl-4">
          <p className="text-sm italic text-muted-foreground">{quote.fr}</p>
          <p className="mt-1 text-sm text-muted-foreground">{quote.zh}</p>
        </blockquote>
      </div>

      {/* Card 1: Profile */}
      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email (read-only) */}
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

      {/* Card 2: Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>我的订阅</CardTitle>
            <SubscriptionBadge status={subStatus ?? null} />
          </div>
        </CardHeader>
        <CardContent>
          {isSubscribed ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Pro {planLabel}
                  {subStatus === "trialing" && user.subscription?.trial_end && (
                    <span className="ml-1 text-muted-foreground">
                      · 试用至 {formatDate(user.subscription.trial_end)}
                    </span>
                  )}
                  {subStatus === "active" &&
                    user.subscription?.current_period_end && (
                      <span className="ml-1 text-muted-foreground">
                        · 续费{" "}
                        {formatDate(user.subscription.current_period_end)}
                      </span>
                    )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-1 h-4 w-4" />
                )}
                管理订阅
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <CardDescription>解锁全部 8,500+ 道题</CardDescription>
              <Button size="sm" onClick={() => router.push("/pricing")}>
                <Sparkles className="mr-1 h-4 w-4" />
                去升级
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Account */}
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

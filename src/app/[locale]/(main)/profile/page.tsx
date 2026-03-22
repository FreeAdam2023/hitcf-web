"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Settings,
  Gift,
  CalendarCheck,
  MessageSquarePlus,
  Sparkles,
  BookOpen,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { SubscriptionBadge } from "@/components/layout/user-menu";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push("/login");
    return null;
  }

  const isSubscribed = hasActiveSubscription();

  const menuItems = [
    {
      icon: Settings,
      label: t("userMenu.accountSettings"),
      onClick: () => router.push("/account"),
    },
    {
      icon: Gift,
      label: t("userMenu.referral"),
      onClick: () => router.push("/referral"),
    },
    {
      icon: CalendarCheck,
      label: t("userMenu.checkin"),
      onClick: () => router.push("/checkin"),
    },
    {
      icon: MessageSquarePlus,
      label: t("userMenu.feedback"),
      onClick: () => setFeedbackOpen(true),
    },
    ...(!isSubscribed
      ? [
          {
            icon: Sparkles,
            label: t("userMenu.upgradePro"),
            onClick: () => router.push("/pricing"),
          },
        ]
      : []),
    {
      icon: BookOpen,
      label: t("nav.resources"),
      onClick: () => router.push("/resources"),
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6">
      {/* User info card */}
      <div className="rounded-2xl bg-card p-5 shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
            {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold truncate">
              {user.name || t("userMenu.defaultName")}
            </p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <div className="mt-1.5">
              <SubscriptionBadge
                status={user.subscription?.status ?? null}
                plan={user.subscription?.plan ?? null}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="rounded-2xl bg-card border overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left text-sm transition-colors active:bg-accent/50 ${
              i > 0 ? "border-t border-border/50" : ""
            }`}
          >
            <item.icon className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="flex-1 font-medium">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="rounded-2xl bg-card border overflow-hidden">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left text-sm transition-colors active:bg-accent/50"
        >
          <LogOut className="h-5 w-5 text-destructive/70 shrink-0" />
          <span className="flex-1 font-medium text-destructive">{t("userMenu.logout")}</span>
        </button>
      </div>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}

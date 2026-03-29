"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut, User, Sparkles, Settings, MessageSquarePlus, Gift, CalendarCheck } from "lucide-react";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SubscriptionBadge({ status, plan }: { status: string | null; plan: string | null }) {
  const t = useTranslations();
  if (plan === "tester" && status === "active") {
    return (
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
        {t('userMenu.tester')}
      </Badge>
    );
  }
  if (plan === "reverse_trial" && status === "active") {
    return (
      <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
        {t('userMenu.proTrial')}
      </Badge>
    );
  }
  if (plan === "recall" && status === "active") {
    return (
      <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
        {t('userMenu.proTrial')}
      </Badge>
    );
  }
  if (plan === "referral" && status === "active") {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        {t('userMenu.proGift')}
      </Badge>
    );
  }
  if (status === "active") {
    return (
      <Badge className="bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 border border-amber-200 hover:from-amber-100 hover:to-yellow-50">
        {t('userMenu.pro')}
      </Badge>
    );
  }
  if (status === "trialing") {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        {t('userMenu.trial')}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">{t('userMenu.free')}</Badge>
  );
}

export function UserMenu({ className }: { className?: string } = {}) {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const router = useRouter();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  if (isLoading) {
    return <Skeleton className={cn("h-8 w-8 rounded-full", className)} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" size="sm" className={className} asChild>
        <Link href="/login">{t('userMenu.login')}</Link>
      </Button>
    );
  }

  const isSubscribed = hasActiveSubscription();

  return (
    <div className={className}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t('userMenu.userMenuLabel')}>
          {user.name ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name || t('userMenu.defaultName')}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-1.5">
            <SubscriptionBadge status={user.subscription?.status ?? null} plan={user.subscription?.plan ?? null} />
          </div>
        </div>
        <DropdownMenuSeparator />
        {!isSubscribed && (
          <DropdownMenuItem onClick={() => router.push("/pricing")}>
            <Sparkles className="me-2 h-4 w-4" />
            {t('userMenu.upgradePro')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push("/account")}>
          <Settings className="me-2 h-4 w-4" />
          {t('userMenu.accountSettings')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/referral")}>
          <Gift className="me-2 h-4 w-4" />
          {t('userMenu.referral')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/checkin")}>
          <CalendarCheck className="me-2 h-4 w-4" />
          {t('userMenu.checkin')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
          <MessageSquarePlus className="me-2 h-4 w-4" />
          {t('userMenu.feedback')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLogoutOpen(true)}>
          <LogOut className="me-2 h-4 w-4" />
          {t('userMenu.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('userMenu.logoutConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('userMenu.logoutConfirmDesc')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => logout()}>{t('userMenu.logoutConfirm')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}

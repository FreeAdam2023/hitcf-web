"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut, User, Sparkles, Settings, MessageSquarePlus } from "lucide-react";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

function SubscriptionBadge({ status }: { status: string | null }) {
  const t = useTranslations();
  if (status === "active") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
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

export function UserMenu() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const router = useRouter();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">{t('userMenu.login')}</Link>
      </Button>
    );
  }

  const isSubscribed = hasActiveSubscription();

  return (
    <>
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
            <SubscriptionBadge status={user.subscription?.status ?? null} />
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
        <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
          <MessageSquarePlus className="me-2 h-4 w-4" />
          {t('userMenu.feedback')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="me-2 h-4 w-4" />
          {t('userMenu.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut, User, Sparkles, Settings } from "lucide-react";
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
  return (
    <Badge variant="secondary">免费用户</Badge>
  );
}

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const hasActiveSubscription = useAuthStore((s) => s.hasActiveSubscription);
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">登录</Link>
      </Button>
    );
  }

  const isSubscribed = hasActiveSubscription();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="用户菜单">
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
          <p className="text-sm font-medium">{user.name || "用户"}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-1.5">
            <SubscriptionBadge status={user.subscription?.status ?? null} />
          </div>
        </div>
        <DropdownMenuSeparator />
        {!isSubscribed && (
          <DropdownMenuItem onClick={() => router.push("/pricing")}>
            <Sparkles className="mr-2 h-4 w-4" />
            升级 Pro
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push("/account")}>
          <Settings className="mr-2 h-4 w-4" />
          账号设置
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { BookOpen, RotateCcw, Languages, Clock, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/tests", icon: BookOpen, labelKey: "nav.tests" },
  { href: "/review", icon: RotateCcw, labelKey: "nav.review" },
  { href: "/vocabulary", icon: Languages, labelKey: "nav.vocabulary" },
  { href: "/history", icon: Clock, labelKey: "nav.history" },
  { href: "/profile", icon: User, labelKey: "nav.profile" },
] as const;

export function MobileTabBar() {
  const t = useTranslations();
  const pathname = usePathname();

  // Hide on immersive pages
  if (pathname.startsWith("/practice/") || pathname.startsWith("/exam/")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-14 items-stretch">
        {TABS.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

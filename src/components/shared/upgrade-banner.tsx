"use client";

import Link from "next/link";
import { Crown, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UpgradeBannerProps {
  /** "hero" = full-width feature showcase, "inline" = compact card in content flow */
  variant?: "hero" | "inline";
  title?: string;
  description?: string;
  features?: string[];
  className?: string;
}

/**
 * Contextual upgrade banner shown to free users at key conversion points.
 * Designed to showcase value, not block with frustration.
 */
export function UpgradeBanner({
  variant = "inline",
  title = "解锁完整备考体验",
  description = "升级 Pro 会员，获取全部 8,500+ 道题目和高级功能",
  features,
  className,
}: UpgradeBannerProps) {
  if (variant === "hero") {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl", className)}>
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/10 to-indigo-400/10" />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/5 blur-2xl" />

        <div className="relative space-y-5 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-lg shadow-primary/25">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {features && features.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/20">
              <Link href="/pricing">
                <Sparkles className="mr-1.5 h-4 w-4" />
                查看方案
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/pricing">
                年付享 2 个月免费试用
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant — compact card for content flow
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-gradient-to-r from-primary/5 via-violet-500/5 to-transparent p-4",
        className,
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-white shadow-sm">
        <Crown className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button asChild size="sm" className="shrink-0 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90">
        <Link href="/pricing">
          升级 Pro
        </Link>
      </Button>
    </div>
  );
}

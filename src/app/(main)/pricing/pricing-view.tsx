"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, X, Shield, CreditCard, RefreshCw, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/stores/auth-store";
import { createCheckout, getCustomerPortal } from "@/lib/api/subscriptions";
import { LOGIN_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    key: "monthly" as const,
    name: "月付",
    price: "$19.99",
    unit: "/ 月",
    badge: null,
    trialLabel: "开始 7 天免费试用",
    recommended: false,
  },
  {
    key: "semi_annual" as const,
    name: "半年付",
    price: "$49.99",
    unit: "/ 6 个月",
    equiv: "≈ $8.33 / 月",
    badge: "省 58%",
    trialLabel: "开始 14 天免费试用",
    recommended: false,
  },
  {
    key: "yearly" as const,
    name: "年付",
    price: "$79.99",
    unit: "/ 年",
    equiv: "≈ $6.67 / 月",
    badge: "2 个月免费",
    trialLabel: "开始 2 个月免费试用",
    recommended: true,
  },
];

const COMPARISON = [
  { feature: "听力题库（44 套 · 1,700+ 题 · 含音频）", free: "前 2 套", pro: true },
  { feature: "阅读题库（44 套 · 1,700+ 题）", free: "前 2 套", pro: true },
  { feature: "口语题库（696 套 · 3,500+ 个话题）", free: "前 1 套", pro: true },
  { feature: "写作题库（515 组 · 1,500+ 个任务）", free: "前 1 套", pro: true },
  { feature: "考试模式（限时 + 随机出题）", free: false, pro: true },
  { feature: "错题本 + 专项突破", free: false, pro: true },
  { feature: "速练模式（按等级 / 题型刷题）", free: false, pro: true },
  { feature: "CLB 等级估算 + 准备度分析", free: false, pro: true },
  { feature: "练习历史 + 统计仪表盘", free: "基础", pro: true },
];

const FAQ = [
  {
    q: "免费试用需要绑定信用卡吗？",
    a: "需要。通过 Stripe 安全绑定后开始免费试用（年付 2 个月，月付/季付 7 天）。试用期内随时取消，不会扣费。",
  },
  {
    q: "可以随时取消吗？",
    a: "可以。在定价页点击「管理订阅」进入 Stripe 客户门户即可一键取消，无需联系客服。取消后 Pro 权限保留至当前付费周期结束。",
  },
  {
    q: "支持哪些支付方式？",
    a: "支持 Visa、Mastercard、American Express 等主流信用卡和借记卡，通过 Stripe 安全处理（PCI DSS Level 1 认证）。",
  },
  {
    q: "能保证考到 CLB 7 吗？",
    a: "我们不承诺任何考试成绩。HiTCF 提供与 TCF Canada 对标的高质量练习环境，帮助你针对性地找到薄弱环节并提升。最终成绩取决于多种因素。详见免责声明。",
  },
  {
    q: "题目和真题一样吗？",
    a: "练习题目来源于公开资料的整理和编辑，覆盖 A1–C2 各等级，格式对标 TCF Canada。但本平台非官方出品，题目不等同于考场原题。",
  },
  {
    q: "如何申请退款？",
    a: "首次付款后 48 小时内可申请全额退款；季付 / 年付用户 14 天内可按比例退款。发送邮件至 support@hitcf.com 即可。详见退款政策。",
  },
];

const TRUST = [
  { icon: Clock, label: "超长免费试用", desc: "年付 2 个月 · 半年付 14 天 · 月付 7 天" },
  { icon: CreditCard, label: "安全支付", desc: "信用卡信息由 Stripe 处理" },
  { icon: RefreshCw, label: "首次扣款可退", desc: "扣款后 48 小时内无理由全额退款" },
  { icon: Shield, label: "随时可取消", desc: "无合约锁定，一键取消自动续费" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PricingView() {
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const isSubscribed = hasActiveSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: "monthly" | "semi_annual" | "yearly") => {
    setLoadingPlan(plan);
    try {
      const { url } = await createCheckout(plan);
      window.location.href = url;
    } catch {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    setLoadingPlan("manage");
    try {
      const { url } = await getCustomerPortal();
      window.location.href = url;
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 py-8">
      {/* ---- Hero ---- */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          年付享 2 个月免费试用 · 随时取消
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            解锁全部 8,500+ 道 TCF 真题
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          听力、阅读、口语、写作四科全覆盖。考试模式 + 错题本 + 速练，系统化备考 CLB 7。
        </p>
        {/* Photo banner */}
        <div className="relative mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          <Image
            src="/hero-ottawa.jpg"
            alt="渥太华国会山"
            width={800}
            height={300}
            className="h-48 w-full object-cover sm:h-56"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 text-left text-white">
            <p className="text-sm font-semibold drop-shadow-md">你的加拿大梦，从这里开始</p>
          </div>
        </div>
      </div>

      {/* ---- Plan Cards ---- */}
      <div className="grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={cn(
              "relative rounded-xl p-[1px]",
              plan.recommended
                ? "bg-gradient-to-b from-primary via-violet-500 to-indigo-400 shadow-lg shadow-primary/20"
                : "bg-border",
            )}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-violet-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  推荐
                </div>
              </div>
            )}
            <Card className="flex h-full flex-col border-0 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{plan.name}</span>
                  {plan.badge && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {plan.badge}
                    </span>
                  )}
                </CardTitle>
                <div className="mt-3">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    {plan.unit}
                  </span>
                </div>
                {plan.equiv && (
                  <p className="mt-1 text-xs text-muted-foreground">{plan.equiv}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-end gap-4 pt-4">
                {isSubscribed ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleManage}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === "manage" ? "跳转中..." : "管理订阅"}
                  </Button>
                ) : isAuthenticated ? (
                  <Button
                    className={cn(
                      "w-full",
                      plan.recommended && "bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90",
                    )}
                    onClick={() => handleSubscribe(plan.key)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.key ? "跳转中..." : plan.trialLabel}
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      "w-full",
                      plan.recommended && "bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90",
                    )}
                    asChild
                  >
                    <a href={LOGIN_URL}>登录后开始免费试用</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* ---- Free vs Pro Comparison ---- */}
      <div>
        <h2 className="mb-6 text-center text-xl font-bold tracking-tight">
          免费版 vs <span className="text-primary">Pro</span>
        </h2>
        <Card>
          <CardContent className="divide-y p-0">
            {/* Header row */}
            <div className="flex items-center gap-3 px-5 py-3">
              <span className="flex-1 text-sm font-medium text-muted-foreground">功能</span>
              <span className="w-16 text-center text-xs font-semibold text-muted-foreground">免费</span>
              <span className="w-16 text-center text-xs font-semibold text-primary">Pro</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
                <span className="flex-1 text-sm">{row.feature}</span>
                <span className="flex w-16 items-center justify-center">
                  {row.free === true ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                  ) : row.free === false ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                      <X className="h-3.5 w-3.5 text-muted-foreground/40" />
                    </div>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {row.free}
                    </span>
                  )}
                </span>
                <span className="flex w-16 items-center justify-center">
                  {row.pro === true ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {String(row.pro)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ---- Trust Badges ---- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TRUST.map((item, i) => {
          const colors = [
            "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
            "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
            "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
            "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
          ];
          return (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2.5 rounded-xl border bg-card p-4 text-center"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colors[i])}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- FAQ ---- */}
      <div>
        <h2 className="mb-6 text-center text-xl font-bold tracking-tight">常见问题</h2>
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b px-5 last:border-0">
                  <AccordionTrigger className="text-left text-sm hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* ---- Legal ---- */}
      <p className="text-center text-xs text-muted-foreground">
        订阅即表示同意{" "}
        <Link
          href="/terms-of-service"
          className="underline hover:text-foreground"
        >
          服务条款
        </Link>
        、
        <Link
          href="/privacy-policy"
          className="underline hover:text-foreground"
        >
          隐私政策
        </Link>{" "}
        和{" "}
        <Link
          href="/refund-policy"
          className="underline hover:text-foreground"
        >
          退款政策
        </Link>
        。
      </p>
    </div>
  );
}

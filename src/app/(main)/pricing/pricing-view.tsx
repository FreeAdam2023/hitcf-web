"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Shield,
  CreditCard,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/stores/auth-store";
import { createCheckout, getCustomerPortal } from "@/lib/api/subscriptions";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    key: "monthly" as const,
    name: "月付",
    price: "US$19.90",
    unit: "/ 月",
    equiv: null,
    badge: null,
    trialLabel: "7 天免费试用",
    recommended: false,
    monthlyPrice: "US$19.90",
    valueDesc: "每天不到 7 毛钱，刷完四科 8,500 道题",
    savingsVsTutor: "比请家教便宜 97%",
  },
  {
    key: "semi_annual" as const,
    name: "半年付",
    price: "US$49.90",
    unit: "/ 6 个月",
    equiv: "≈ US$8.32 / 月",
    badge: "省 58%",
    trialLabel: "14 天免费试用",
    recommended: false,
    monthlyPrice: "US$8.32",
    valueDesc: "每月一杯奶茶的钱，刷完四科 8,500 道题",
    savingsVsTutor: "比请家教便宜 99%",
  },
  {
    key: "yearly" as const,
    name: "年付",
    price: "US$79.90",
    unit: "/ 年",
    equiv: "含 2 个月免费，≈ US$6.66 / 月",
    badge: "最受欢迎",
    trialLabel: "2 个月免费试用",
    recommended: true,
    monthlyPrice: "US$6.66",
    valueDesc: "每月一杯星巴克的钱，刷完四科 8,500 道题",
    savingsVsTutor: "比请家教便宜 99%",
  },
];

const COMPARISON = [
  { feature: "听力题库（44 套 · 1,700+ 题 · 含音频）", free: "前 1 套", pro: true },
  { feature: "阅读题库（44 套 · 1,700+ 题）", free: "前 2 套", pro: true },
  { feature: "口语题库（696 套 · 3,500+ 个话题）", free: false, pro: true },
  { feature: "写作题库（515 组 · 1,500+ 个任务）", free: false, pro: true },
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PricingView() {
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const isSubscribed = hasActiveSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "semi_annual" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const activePlan = PLANS.find((p) => p.key === selectedPlan)!;

  const handleSubscribe = async (plan: "monthly" | "semi_annual" | "yearly") => {
    setLoadingPlan(plan);
    try {
      const { url } = await createCheckout(plan);
      window.location.href = url;
    } catch {
      window.location.href = "/payment/error";
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
    <div className="mx-auto max-w-4xl space-y-10 py-6 sm:py-10">
      {/* ============================================================ */}
      {/*  ABOVE THE FOLD: headline + plans + CTA + value anchor       */}
      {/* ============================================================ */}

      {/* ---- Headline ---- */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          8,500+ 道 TCF 真题，四科全覆盖
        </h1>
        <p className="mt-2 text-muted-foreground">
          考试模式 + 错题本 + 速练，系统化备考 CLB 7
        </p>
      </div>

      {/* ---- Plan Cards ---- */}
      <div>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            return (
              <div
                key={plan.key}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedPlan(plan.key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan(plan.key); }}
                className={cn(
                  "relative cursor-pointer rounded-xl p-[1px] transition-all",
                  plan.recommended
                    ? "bg-gradient-to-b from-primary via-violet-500 to-indigo-400"
                    : "bg-border",
                  isSelected
                    ? "shadow-lg shadow-primary/20 scale-[1.02] ring-2 ring-primary/50"
                    : "hover:bg-primary/30",
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-violet-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      最受欢迎
                    </div>
                  </div>
                )}
                <Card className="flex h-full flex-col border-0 bg-card">
                  <div className="flex flex-1 flex-col gap-1 p-5 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{plan.name}</span>
                      {plan.badge && !plan.recommended && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                      <span className="ml-1 text-sm text-muted-foreground">{plan.unit}</span>
                    </div>
                    {plan.equiv && (
                      <p className="text-xs text-muted-foreground">{plan.equiv}</p>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* ---- Dynamic value line ---- */}
        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {activePlan.valueDesc}
            <span className="mx-1.5 text-muted-foreground/40">·</span>
            {activePlan.savingsVsTutor}
          </p>
        </div>

        {/* ---- CTA ---- */}
        <div className="mt-5 text-center">
          {isSubscribed ? (
            <Button
              size="lg"
              variant="outline"
              className="px-10"
              onClick={handleManage}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "manage" ? "跳转中..." : "管理订阅"}
            </Button>
          ) : isAuthenticated ? (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 px-10"
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === selectedPlan ? "跳转中..." : `${activePlan.trialLabel}，不满意不花钱`}
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 px-10"
              asChild
            >
              <Link href="/register">{activePlan.trialLabel}，不满意不花钱</Link>
            </Button>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            所有价格均以美元（USD）计价 · 试用期内取消不收费
          </p>
        </div>
      </div>

      {/* ---- Trust Strip ---- */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 最长 2 个月免费试用</span>
        <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Stripe 安全支付</span>
        <span className="inline-flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> 48h 无理由退款</span>
        <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> 随时一键取消</span>
      </div>

      {/* ============================================================ */}
      {/*  BELOW THE FOLD: details for skeptics                        */}
      {/* ============================================================ */}

      {/* ---- Free vs Pro ---- */}
      <div>
        <h2 className="mb-4 text-center text-lg font-bold tracking-tight">
          免费版 vs <span className="text-primary">Pro</span>
        </h2>
        <Card>
          <CardContent className="divide-y p-0">
            <div className="flex items-center gap-3 px-5 py-3">
              <span className="flex-1 text-sm font-medium text-muted-foreground">功能</span>
              <span className="w-16 text-center text-xs font-semibold text-muted-foreground">免费</span>
              <span className="w-16 text-center text-xs font-semibold text-primary">Pro</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/30">
                <span className="flex-1 text-sm">{row.feature}</span>
                <span className="flex w-16 items-center justify-center">
                  {row.free === true ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                  ) : row.free === false ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                      <X className="h-3 w-3 text-muted-foreground/40" />
                    </div>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {row.free}
                    </span>
                  )}
                </span>
                <span className="flex w-16 items-center justify-center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ---- FAQ ---- */}
      <div>
        <h2 className="mb-4 text-center text-lg font-bold tracking-tight">常见问题</h2>
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
        <Link href="/terms-of-service" className="underline hover:text-foreground">服务条款</Link>、
        <Link href="/privacy-policy" className="underline hover:text-foreground">隐私政策</Link> 和{" "}
        <Link href="/refund-policy" className="underline hover:text-foreground">退款政策</Link>。
      </p>
    </div>
  );
}

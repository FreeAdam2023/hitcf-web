"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Shield, CreditCard, RefreshCw, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/stores/auth-store";
import { createCheckout, getCustomerPortal } from "@/lib/api/subscriptions";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    key: "monthly" as const,
    name: "月付",
    price: "$14.99",
    unit: "/ 月",
    badge: null,
    recommended: false,
  },
  {
    key: "quarterly" as const,
    name: "季付",
    price: "$29.99",
    unit: "/ 3 个月",
    equiv: "≈ $10.00 / 月",
    badge: "省 33%",
    recommended: true,
  },
  {
    key: "yearly" as const,
    name: "年付",
    price: "$59.99",
    unit: "/ 年",
    equiv: "≈ $5.00 / 月",
    badge: "省 67%",
    recommended: false,
  },
];

const COMPARISON = [
  { feature: "听力题库（42 套 · 1,629 题 · 含音频）", free: "前 5 套", pro: true },
  { feature: "阅读题库（44 套 · 1,681 题）", free: "前 5 套", pro: true },
  { feature: "口语题库（20 套 · 100 个话题）", free: "前 2 套", pro: true },
  { feature: "写作题库（10 套 · 30 个任务）", free: "前 2 套", pro: true },
  { feature: "考试模式（限时 + 随机出题）", free: false, pro: true },
  { feature: "错题本 + 专项突破", free: false, pro: true },
  { feature: "速练模式（按等级 / 题型刷题）", free: false, pro: true },
  { feature: "CLB 等级估算 + 准备度分析", free: false, pro: true },
  { feature: "练习历史 + 统计仪表盘", free: "基础", pro: true },
];

const FAQ = [
  {
    q: "免费试用需要绑定信用卡吗？",
    a: "需要。通过 Stripe 安全绑定后开始 7 天免费试用。试用期内随时取消，不会扣费。",
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
  { icon: Clock, label: "7 天免费试用", desc: "不满意随时取消" },
  { icon: CreditCard, label: "Stripe 安全支付", desc: "PCI DSS Level 1" },
  { icon: Shield, label: "HTTPS 加密传输", desc: "Cloudflare 保护" },
  { icon: RefreshCw, label: "48 小时无理由退款", desc: "零风险" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PricingView() {
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const isSubscribed = hasActiveSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: "monthly" | "quarterly" | "yearly") => {
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
        <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
          7 天免费试用 · 随时取消
        </Badge>
        <h1 className="text-3xl font-bold sm:text-4xl">
          解锁全部 3,400+ 道 TCF 真题
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          听力、阅读、口语、写作四科全覆盖。考试模式 + 错题本 + 速练，系统化备考 CLB 7。
        </p>
      </div>

      {/* ---- Plan Cards ---- */}
      <div className="grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.key}
            className={
              plan.recommended
                ? "relative flex flex-col border-2 border-primary shadow-md"
                : "flex flex-col"
            }
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground shadow-sm">
                  推荐
                </Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{plan.name}</span>
                {plan.badge && (
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/5 text-primary"
                  >
                    {plan.badge}
                  </Badge>
                )}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.unit}
                </span>
              </div>
              {plan.equiv && (
                <p className="text-xs text-muted-foreground">{plan.equiv}</p>
              )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-end gap-4 pt-2">
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
                  className="w-full"
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.key ? "跳转中..." : "开始 7 天免费试用"}
                </Button>
              ) : (
                <Button className="w-full" asChild>
                  <a href="/cdn-cgi/access/login">登录后开始免费试用</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Free vs Pro Comparison ---- */}
      <div>
        <h2 className="mb-4 text-center text-xl font-bold">
          免费版 vs Pro
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">功能</th>
                    <th className="w-24 px-4 py-3 text-center font-medium">
                      免费
                    </th>
                    <th className="w-24 px-4 py-3 text-center font-medium text-primary">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr
                      key={i}
                      className={i < COMPARISON.length - 1 ? "border-b" : ""}
                    >
                      <td className="px-4 py-2.5">{row.feature}</td>
                      <td className="px-4 py-2.5 text-center">
                        {row.free === true ? (
                          <Check className="mx-auto h-4 w-4 text-green-600" />
                        ) : row.free === false ? (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {row.pro === true ? (
                          <Check className="mx-auto h-4 w-4 text-primary" />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {String(row.pro)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Trust Badges ---- */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TRUST.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 p-4 text-center"
          >
            <item.icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-xs text-muted-foreground">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* ---- FAQ ---- */}
      <div>
        <h2 className="mb-4 text-center text-xl font-bold">常见问题</h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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

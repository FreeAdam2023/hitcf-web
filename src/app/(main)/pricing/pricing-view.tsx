"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { createCheckout, getCustomerPortal } from "@/lib/api/subscriptions";

const FEATURES = ["全部题库", "考试模式", "错题本", "速练"];

const PLANS = [
  {
    key: "monthly" as const,
    name: "月付方案",
    price: "$X",
    period: "/ 月",
    badge: null,
  },
  {
    key: "yearly" as const,
    name: "年付方案",
    price: "$Y",
    period: "/ 年",
    badge: "节省 XX%",
  },
];

export function PricingView() {
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const isSubscribed = hasActiveSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
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
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">选择你的方案</h1>
        <p className="mt-2 text-muted-foreground">
          解锁全部 TCF Canada 练习题库，7 天免费试用
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <Card key={plan.key} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                {plan.badge && (
                  <Badge variant="secondary">{plan.badge}</Badge>
                )}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-6">
              <ul className="space-y-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

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
                  {loadingPlan === plan.key
                    ? "跳转中..."
                    : "7 天免费试用"}
                </Button>
              ) : (
                <Button className="w-full" asChild>
                  <a href="/cdn-cgi/access/login">登录后订阅</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

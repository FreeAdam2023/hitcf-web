"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyPracticeItem } from "@/lib/api/types";

interface DailyPracticeChartProps {
  data: DailyPracticeItem[];
}

export function DailyPracticeChart({ data }: DailyPracticeChartProps) {
  const hasAny = data.some((d) => d.count > 0);
  if (!hasAny) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">每日练习量</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            完成练习后显示每日练习量
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d, i) => ({
    date: d.date,
    label:
      i % 5 === 0
        ? new Date(d.date).toLocaleDateString("zh-CN", {
            month: "short",
            day: "numeric",
          })
        : "",
    count: d.count,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">每日练习量</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip
              labelFormatter={(_label, payload) => {
                if (payload?.[0]?.payload?.date) {
                  return new Date(payload[0].payload.date).toLocaleDateString(
                    "zh-CN",
                    { month: "long", day: "numeric" },
                  );
                }
                return "";
              }}
              formatter={(value) => [`${value} 次`, "练习次数"]}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

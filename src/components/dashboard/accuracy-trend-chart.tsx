"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccuracyTrendItem } from "@/lib/api/types";

interface AccuracyTrendChartProps {
  data: AccuracyTrendItem[];
}

export function AccuracyTrendChart({ data }: AccuracyTrendChartProps) {
  if (data.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">正确率趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            完成 2 次练习后显示趋势图
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.completed_at).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    }),
    accuracy: Math.round(d.accuracy * 100),
    score: d.score,
    total: d.total,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">正确率趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              className="text-muted-foreground"
            />
            <Tooltip
              formatter={(value, _name, props) => [
                `${value}% (${(props.payload as { score: number; total: number }).score}/${(props.payload as { score: number; total: number }).total})`,
                "正确率",
              ]}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface LevelRadarChartProps {
  data: Record<string, { answered: number; correct: number; accuracy: number }>;
}

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function LevelRadarChart({ data }: LevelRadarChartProps) {
  const t = useTranslations();
  const entries = Object.entries(data);
  const chartData = LEVEL_ORDER.filter((level) => data[level]).map((level) => ({
    level,
    accuracy: Math.round(data[level].accuracy * 100),
    answered: data[level].answered,
  }));

  if (entries.length < 2 || chartData.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("dashboard.charts.levelRadar")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {t("dashboard.charts.levelRadarEmpty")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("dashboard.charts.levelRadar")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={chartData}>
            <PolarGrid className="stroke-muted" />
            <PolarAngleAxis
              dataKey="level"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value, _name, props) => [
                t("dashboard.charts.radarTooltip", { value: String(value), answered: (props.payload as { answered: number }).answered }),
                t("dashboard.charts.radarLabel"),
              ]}
            />
            <Radar
              dataKey="accuracy"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePracticeStore } from "@/stores/practice-store";
import { startSpeedDrill } from "@/lib/api/speed-drill";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const COUNT_OPTIONS = [5, 10, 15, 20];

export function SpeedDrillConfig() {
  const router = useRouter();
  const initPractice = usePracticeStore((s) => s.init);

  const [type, setType] = useState("listening");
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(LEVELS));
  const [count, setCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const levels = selectedLevels.size === LEVELS.length ? undefined : Array.from(selectedLevels);
      const result = await startSpeedDrill({
        type,
        levels,
        count: Number(count),
      });

      if (!result.questions.length) {
        setError("没有更多未做过的题目");
        setLoading(false);
        return;
      }

      initPractice(result.attempt_id, result.questions);
      router.push(`/practice/${result.attempt_id}`);
    } catch {
      setError("启动速练失败，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">速练模式</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">选择类型</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={type} onValueChange={setType}>
            <TabsList className="w-full">
              <TabsTrigger value="listening" className="flex-1">
                听力
              </TabsTrigger>
              <TabsTrigger value="reading" className="flex-1">
                阅读
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">选择等级</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {LEVELS.map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selectedLevels.has(level)}
                  onCheckedChange={() => toggleLevel(level)}
                />
                {level}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">题目数量</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={count}
            onValueChange={setCount}
            className="flex gap-4"
          >
            {COUNT_OPTIONS.map((n) => (
              <label
                key={n}
                className="flex items-center gap-2 text-sm"
              >
                <RadioGroupItem value={String(n)} />
                {n} 题
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleStart}
        disabled={loading || selectedLevels.size === 0}
      >
        <Zap className="mr-1 h-4 w-4" />
        {loading ? "正在生成..." : "开始速练"}
      </Button>
    </div>
  );
}

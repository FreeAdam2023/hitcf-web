"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReviewAnswer } from "@/lib/api/types";

interface LevelBreakdownProps {
  answers: ReviewAnswer[];
}

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function LevelBreakdown({ answers }: LevelBreakdownProps) {
  // Group by level
  const groups = new Map<string, { total: number; correct: number }>();
  for (const a of answers) {
    const level = a.level || "未分级";
    const entry = groups.get(level) || { total: 0, correct: 0 };
    entry.total++;
    if (a.is_correct) entry.correct++;
    groups.set(level, entry);
  }

  // If all levels are null, don't render
  if (groups.size === 0 || (groups.size === 1 && groups.has("未分级"))) {
    return null;
  }

  // Sort: known levels first in order, then "未分级" at end
  const sorted = Array.from(groups.entries()).sort(([a], [b]) => {
    const ai = LEVEL_ORDER.indexOf(a);
    const bi = LEVEL_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">等级分布</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>等级</TableHead>
              <TableHead className="text-center">题数</TableHead>
              <TableHead className="text-center">正确</TableHead>
              <TableHead className="text-center">正确率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(([level, { total, correct }]) => {
              const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
              return (
                <TableRow key={level}>
                  <TableCell className="font-medium">{level}</TableCell>
                  <TableCell className="text-center">{total}</TableCell>
                  <TableCell className="text-center">{correct}</TableCell>
                  <TableCell className="text-center">{pct}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

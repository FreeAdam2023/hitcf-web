"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import type { ReviewAnswer } from "@/lib/api/types";

interface LevelBreakdownProps {
  answers: ReviewAnswer[];
}

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function LevelBreakdown({ answers }: LevelBreakdownProps) {
  const t = useTranslations();
  const ungradedLabel = t('results.levelBreakdown.ungraded');

  // Group by level
  const groups = new Map<string, { total: number; correct: number }>();
  for (const a of answers) {
    const level = a.level || ungradedLabel;
    const entry = groups.get(level) || { total: 0, correct: 0 };
    entry.total++;
    if (a.is_correct) entry.correct++;
    groups.set(level, entry);
  }

  // If all levels are null, don't render
  if (groups.size === 0 || (groups.size === 1 && groups.has(ungradedLabel))) {
    return null;
  }

  // Sort: known levels first in order, then ungraded at end
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
      <h2 className="text-lg font-semibold">{t('results.levelBreakdown.title')}</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('results.levelBreakdown.level')}</TableHead>
              <TableHead className="text-center">{t('results.levelBreakdown.count')}</TableHead>
              <TableHead className="text-center">{t('results.levelBreakdown.correct')}</TableHead>
              <TableHead className="text-center">{t('results.levelBreakdown.accuracy')}</TableHead>
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

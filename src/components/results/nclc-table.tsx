"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NclcTableProps {
  tcfPoints: number;
  testType: "listening" | "reading";
}

const NCLC_ROWS = [
  { level: "4", co: "331–368", ce: "342–374", coMin: 331, ceMin: 342 },
  { level: "5", co: "369–397", ce: "375–405", coMin: 369, ceMin: 375 },
  { level: "6", co: "398–457", ce: "406–452", coMin: 398, ceMin: 406 },
  { level: "7", co: "458–502", ce: "453–498", coMin: 458, ceMin: 453 },
  { level: "8", co: "503–522", ce: "499–523", coMin: 503, ceMin: 499 },
  { level: "9", co: "523–548", ce: "524–548", coMin: 523, ceMin: 524 },
  { level: "10+", co: "549–699", ce: "549–699", coMin: 549, ceMin: 549 },
];

function getUserNclcLevel(tcfPoints: number, testType: "listening" | "reading"): string | null {
  const key = testType === "listening" ? "coMin" : "ceMin";
  let matched: string | null = null;
  for (const row of NCLC_ROWS) {
    if (tcfPoints >= row[key]) matched = row.level;
  }
  return matched;
}

export function NclcTable({ tcfPoints, testType }: NclcTableProps) {
  const userLevel = getUserNclcLevel(tcfPoints, testType);
  const scoreCol = testType === "listening" ? "co" : "ce";
  const colLabel = testType === "listening" ? "听力 (CO)" : "阅读 (CE)";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">NCLC 等级对照</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-2 font-medium">NCLC</th>
                <th className="px-3 py-2 font-medium">{colLabel}</th>
              </tr>
            </thead>
            <tbody>
              {NCLC_ROWS.map((row) => {
                const isActive = row.level === userLevel;
                return (
                  <tr
                    key={row.level}
                    className={cn(
                      "border-b last:border-0",
                      isActive && "bg-primary/10 ring-1 ring-inset ring-primary/30 font-semibold",
                    )}
                  >
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {row.level}
                        {row.level === "7" && " *"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono">
                      {row[scoreCol]}
                      {isActive && (
                        <span className="ml-2 text-xs text-primary font-semibold">
                          ← 你的位置
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          * NCLC 7 = CLB 7，Express Entry / PEQ 最低语言要求
        </p>
      </CardContent>
    </Card>
  );
}

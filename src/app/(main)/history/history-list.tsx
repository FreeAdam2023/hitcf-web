"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { listAttempts } from "@/lib/api/attempts";
import { getEstimatedTcfLevel } from "@/lib/tcf-levels";
import type { PaginatedResponse, AttemptResponse } from "@/lib/api/types";

import { MODE_LABELS, TYPE_LABELS, TYPE_COLORS } from "@/lib/constants";

export function HistoryList() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<AttemptResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAttempts({ page, page_size: 20 });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">练习记录</h1>

      {loading ? (
        <LoadingSpinner />
      ) : !data?.items.length ? (
        <EmptyState title="暂无记录" description="完成练习后记录会出现在这里" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>题套</TableHead>
                  <TableHead>模式</TableHead>
                  <TableHead className="text-right">得分</TableHead>
                  <TableHead className="text-center">预估等级</TableHead>
                  <TableHead className="text-right">时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((a) => {
                  const isCompleted = a.status === "completed";
                  const tcf =
                    isCompleted && a.score != null
                      ? getEstimatedTcfLevel(a.score, a.total)
                      : null;

                  const resumeUrl = isCompleted
                    ? `/results/${a.id}`
                    : a.mode === "exam"
                      ? `/exam/${a.id}`
                      : `/practice/${a.id}`;

                  return (
                    <TableRow
                      key={a.id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => router.push(resumeUrl)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {a.test_set_name || "-"}
                          </span>
                          {a.test_set_type && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${TYPE_COLORS[a.test_set_type]?.badge ?? ""}`}
                            >
                              {TYPE_LABELS[a.test_set_type] || a.test_set_type}
                            </Badge>
                          )}
                          {!isCompleted && (
                            <Badge variant="destructive" className="text-xs">
                              未完成
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {MODE_LABELS[a.mode] || a.mode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isCompleted
                          ? `${a.score ?? "-"}/${a.total}`
                          : `${a.answered_count}/${a.total}`}
                      </TableCell>
                      <TableCell className="text-center">
                        {tcf ? (
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tcf.color} ${tcf.bgColor}`}
                          >
                            {tcf.level}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {isCompleted ? "-" : "进行中"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {a.completed_at
                          ? new Date(a.completed_at).toLocaleDateString("zh-CN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : new Date(a.started_at).toLocaleDateString("zh-CN", {
                              month: "short",
                              day: "numeric",
                            })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page}
            totalPages={data.total_pages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

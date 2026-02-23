"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAttempts } from "@/lib/api/attempts";
import { listTestSets } from "@/lib/api/test-sets";
import { createAttempt } from "@/lib/api/attempts";

export function PlacementBanner() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [firstFreeId, setFirstFreeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show if user has zero completed attempts
    Promise.all([
      listAttempts({ page_size: 1 }),
      listTestSets({ type: "listening", page_size: 10 }),
    ])
      .then(([attemptsRes, testsRes]) => {
        const hasCompleted = attemptsRes.items.some(
          (a) => a.status === "completed",
        );
        if (!hasCompleted) {
          const sorted = [...testsRes.items].sort((a, b) => a.order - b.order);
          const free = sorted.find((t) => t.is_free);
          if (free) {
            setFirstFreeId(free.id);
            setShow(true);
          }
        }
      })
      .catch((err) => {
        console.error("PlacementBanner: failed to load data", err);
      });
  }, []);

  if (!show || !firstFreeId) return null;

  async function handleStart() {
    if (!firstFreeId) return;
    setLoading(true);
    try {
      const res = await createAttempt({
        test_set_id: firstFreeId,
        mode: "practice",
      });
      router.push(`/practice/${res.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Zap className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-3 text-lg font-bold">
        测一测你的 CLB 水平
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        做一套免费听力真题，2 分钟后告诉你离 CLB 7 还差多远
      </p>
      <Button
        className="mt-4"
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? "正在准备..." : "立即测试"}
      </Button>
    </div>
  );
}

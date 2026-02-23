"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-950/20">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-lg font-medium">出现了一些问题</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {error.message || "页面加载时发生了错误，请稍后再试。"}
      </p>
      <Button className="mt-6" onClick={reset}>
        重试
      </Button>
    </div>
  );
}

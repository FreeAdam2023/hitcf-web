import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
        <FileQuestion className="h-8 w-8 text-primary/40" />
      </div>
      <h2 className="text-lg font-medium">页面未找到</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        你访问的页面不存在或已被移除。
      </p>
      <Button className="mt-6" asChild>
        <Link href="/tests">返回题库</Link>
      </Button>
    </div>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-card py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Left — brand + copyright */}
          <div className="space-y-1">
            <div className="text-sm font-medium">HiTCF</div>
            <div className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} HiTCF. All rights reserved.
            </div>
          </div>

          {/* Center — nav links */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/tests"
              className="transition-colors hover:text-foreground"
            >
              题库
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-foreground"
            >
              定价
            </Link>
            <Link
              href="/resources"
              className="transition-colors hover:text-foreground"
            >
              资源
            </Link>
            <a
              href="mailto:support@hitcf.com"
              className="transition-colors hover:text-foreground"
            >
              联系我们
            </a>
          </div>

          {/* Right — legal links */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <Link
              href="/terms-of-service"
              className="transition-colors hover:text-foreground"
            >
              服务条款
            </Link>
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-foreground"
            >
              隐私政策
            </Link>
            <Link
              href="/refund-policy"
              className="transition-colors hover:text-foreground"
            >
              退款政策
            </Link>
            <Link
              href="/disclaimer"
              className="transition-colors hover:text-foreground"
            >
              免责声明
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

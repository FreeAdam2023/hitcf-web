"use client";

import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "./user-menu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link href="/tests" className="mr-6">
          <Image src="/logo.png" alt="HiTCF" width={56} height={56} />
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/tests"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            题库
          </Link>
          <Link
            href="/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            仪表盘
          </Link>
          <Link
            href="/wrong-answers"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            错题本
          </Link>
          <Link
            href="/speed-drill"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            速练
          </Link>
        </nav>

        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

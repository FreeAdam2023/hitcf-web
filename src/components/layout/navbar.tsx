"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePracticeStore } from "@/stores/practice-store";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/tests", label: "题库" },
  { href: "/dashboard", label: "仪表盘" },
  { href: "/wrong-answers", label: "错题本" },
  { href: "/history", label: "记录" },
  { href: "/speed-drill", label: "速练" },
  { href: "/pricing", label: "定价" },
  { href: "/resources", label: "资源" },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pathname = usePathname();
  const isImmersive = pathname.startsWith("/practice/") || pathname.startsWith("/exam/");

  const allItems = NAV_ITEMS;

  if (isImmersive) {
    return <ImmersiveHeader />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        {/* Mobile hamburger — defer Sheet until mounted to avoid Radix hydration mismatch */}
        {mounted ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-1 pt-6">
                {allItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.href || pathname.startsWith(item.href + "/")
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="ghost" size="icon" className="mr-2 md:hidden" disabled>
            <Menu className="h-5 w-5" />
            <span className="sr-only">打开菜单</span>
          </Button>
        )}

        <Link href="/" className="mr-4 shrink-0">
          <Image src="/logo.png" alt="HiTCF" width={40} height={40} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 text-sm md:flex">
          {allItems.map((item) => {
            const isCurrent = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isCurrent
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function ImmersiveHeader() {
  const router = useRouter();
  const answersSize = usePracticeStore((s) => s.answers.size);
  const totalQuestions = usePracticeStore((s) => s.questions.length);
  const startedAt = usePracticeStore((s) => s.startedAt);

  const startRef = useRef(startedAt ? new Date(startedAt).getTime() : Date.now());
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor((Date.now() - startRef.current) / 1000))
  );

  useEffect(() => {
    if (startedAt) {
      startRef.current = new Date(startedAt).getTime();
    }
    const timer = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startRef.current) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-10 max-w-7xl items-center px-4">
        <Image src="/logo.png" alt="HiTCF" width={40} height={40} />
        <div className="ml-4 flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatElapsed(elapsed)}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                退出练习
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认退出练习？</AlertDialogTitle>
                <AlertDialogDescription>
                  已答 {answersSize} / {totalQuestions} 题。
                  {answersSize > 0 && " 退出后当前练习进度将保留。"}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>继续练习</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push("/tests")}>
                  确认退出
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}

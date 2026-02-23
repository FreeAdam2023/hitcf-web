"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/tests", label: "题库" },
  { href: "/dashboard", label: "仪表盘" },
  { href: "/wrong-answers", label: "错题本" },
  { href: "/history", label: "记录" },
  { href: "/speed-drill", label: "速练" },
  { href: "/resources", label: "资源" },
];

export function Navbar() {
  const canAccessPaid = useAuthStore((s) => s.canAccessPaid);
  const pathname = usePathname();

  const allItems = canAccessPaid()
    ? NAV_ITEMS
    : [...NAV_ITEMS, { href: "/pricing", label: "定价" }];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        {/* Mobile hamburger */}
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

        <Link href="/" className="mr-6">
          <Image src="/logo.png" alt="HiTCF" width={56} height={56} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm md:flex">
          {allItems.map((item) => {
            const isCurrent = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative pb-1 transition-colors",
                  isCurrent
                    ? "font-medium text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFixedLayout = pathname.startsWith("/practice/") || pathname.startsWith("/exam/");

  // Lock body scroll on practice/exam pages
  useEffect(() => {
    if (!isFixedLayout) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isFixedLayout]);

  return (
    <main
      className={cn(
        "mx-auto w-full px-4 animate-fade-in-up",
        isFixedLayout ? "max-w-7xl h-[calc(100dvh-4rem)] overflow-hidden py-3" : "max-w-6xl flex-1 py-6",
      )}
    >
      {children}
    </main>
  );
}

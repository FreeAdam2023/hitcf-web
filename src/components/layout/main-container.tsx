"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWide = pathname.startsWith("/practice/") || pathname.startsWith("/exam/");

  return (
    <main
      className={cn(
        "mx-auto w-full flex-1 px-4 py-6 animate-fade-in-up",
        isWide ? "max-w-7xl" : "max-w-5xl",
      )}
    >
      {children}
    </main>
  );
}

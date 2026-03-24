"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFixedLayout = pathname.startsWith("/practice/") || pathname.startsWith("/exam/");

  // Lock body scroll on practice/exam pages (desktop only — mobile needs natural scroll)
  useEffect(() => {
    if (!isFixedLayout) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      if (mq.matches) {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isFixedLayout]);

  return (
    <main
      className={cn(
        "mx-auto w-full px-4",
        isFixedLayout
          ? "max-w-7xl xl:max-w-[1400px] lg:h-[calc(100dvh-2.5rem)] lg:overflow-hidden py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
          : "max-w-6xl flex-1 py-6 pb-24 md:pb-6 animate-fade-in-up",
      )}
    >
      {children}
    </main>
  );
}

"use client";

import { usePathname } from "@/i18n/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/practice/") || pathname.startsWith("/exam/");
  if (hidden) return null;
  return (
    <div className="hidden md:block">
      <Footer />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, List, Loader2, Pen } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getWritingSidebar } from "@/lib/api/writing";
import { createWritingAttempt } from "@/lib/api/writing-attempts";
import { cn } from "@/lib/utils";
import type { WritingSidebarItem } from "@/lib/api/types";

interface WritingSidebarProps {
  currentTestSetId: string;
  mode: "practice" | "exam";
}

function StatusIcon({ status }: { status: WritingSidebarItem["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />;
    case "in_progress":
      return <Pen className="h-4 w-4 shrink-0 text-blue-500" />;
    default:
      return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />;
  }
}

function SidebarList({
  items,
  currentTestSetId,
  navigating,
  onNavigate,
}: {
  items: WritingSidebarItem[];
  currentTestSetId: string;
  navigating: string | null;
  onNavigate: (testSetId: string) => void;
}) {
  const t = useTranslations("writingSidebar");
  return (
    <div className="space-y-0.5">
      <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("title")}
      </p>
      {items.map((item) => {
        const isCurrent = item.test_set_id === currentTestSetId;
        const isNavigating = navigating === item.test_set_id;
        return (
          <button
            key={item.test_set_id}
            type="button"
            disabled={isCurrent || isNavigating}
            onClick={() => onNavigate(item.test_set_id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              isCurrent
                ? "bg-primary/10 font-medium"
                : "hover:bg-muted/70",
              isNavigating && "opacity-60",
            )}
          >
            {isNavigating ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <StatusIcon status={item.status} />
            )}
            <span className="flex-1 truncate">
              {item.combinaison_number != null
                ? `Comb. ${item.combinaison_number}`
                : item.name}
            </span>
            {item.best_score != null && (
              <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                {item.best_score}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function WritingSidebar({ currentTestSetId, mode }: WritingSidebarProps) {
  const t = useTranslations("writingSidebar");
  const router = useRouter();
  const [items, setItems] = useState<WritingSidebarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWritingSidebar()
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleNavigate = useCallback(
    async (testSetId: string) => {
      if (navigating) return;
      setNavigating(testSetId);
      try {
        const attempt = await createWritingAttempt({ test_set_id: testSetId, mode });
        router.push(
          mode === "practice"
            ? `/writing-practice/${attempt.id}`
            : `/writing-exam/${attempt.id}`,
        );
      } catch {
        toast.error(t("navigating"));
        setNavigating(null);
      }
    },
    [navigating, mode, router, t],
  );

  // ── Desktop: fixed sidebar ──
  const desktopSidebar = (
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r p-2 lg:block">
      {loading ? (
        <div className="space-y-2 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <SidebarList
          items={items}
          currentTestSetId={currentTestSetId}
          navigating={navigating}
          onNavigate={handleNavigate}
        />
      )}
    </aside>
  );

  // ── Mobile: floating button + Sheet ──
  const mobileSidebar = (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-20 left-3 z-40 h-10 w-10 rounded-full shadow-lg"
          >
            <List className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">{t("title")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <SidebarList
                items={items}
                currentTestSetId={currentTestSetId}
                navigating={navigating}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}

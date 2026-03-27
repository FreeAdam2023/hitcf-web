"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Sparkles, Wrench, Bug, Megaphone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fetchAnnouncements,
  markAnnouncementsRead,
  type AnnouncementItem,
} from "@/lib/api/announcements";
import {
  getLocalizedChangelog,
  getUnreadChangelogEntries,
  markChangelogRead,
} from "@/lib/changelog";

type DisplayItem = AnnouncementItem & { _href?: string };

const TYPE_ICONS: Record<string, typeof Sparkles> = {
  feature: Sparkles,
  improvement: Wrench,
  fix: Bug,
  news: Megaphone,
};

const TYPE_COLORS: Record<string, string> = {
  feature: "text-purple-500",
  improvement: "text-blue-500",
  fix: "text-orange-500",
  news: "text-green-500",
};

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationBell() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [changelogItems, setChangelogItems] = useState<DisplayItem[]>([]);
  const [changelogUnread, setChangelogUnread] = useState(0);
  const [open, setOpen] = useState(false);

  // Load backend announcements
  const load = useCallback(() => {
    if (!isAuthenticated) return;
    fetchAnnouncements(10)
      .then((data) => {
        setItems(data.items);
        setUnreadCount(data.unread_count);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 120_000);
    return () => clearInterval(timer);
  }, [load]);

  // Load virtual changelog notifications from localStorage
  // Always show recent entries (last 7 days); only toggle is_unread on read
  useEffect(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const localized = getLocalizedChangelog(locale);
    const recentEntries = localized.filter((e) => e.date > cutoffStr).slice(0, 1);

    const refresh = () => {
      const unread = getUnreadChangelogEntries();
      const unreadDates = new Set(unread.map((e) => e.date));
      setChangelogUnread(unread.length);
      setChangelogItems(
        recentEntries.map((e, i) => ({
          id: `changelog-${i}`,
          title: { zh: e.title, en: e.title },
          content: {
            zh: e.details?.[0] || "",
            en: e.details?.[0] || "",
          },
          type: e.type,
          published_at: `${e.date}T00:00:00Z`,
          is_unread: unreadDates.has(e.date),
          _href: "/changelog",
        })),
      );
    };
    refresh();
    window.addEventListener("changelog-read", refresh);
    return () => window.removeEventListener("changelog-read", refresh);
  }, [locale]);

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        if (unreadCount > 0) {
          markAnnouncementsRead()
            .then(() => {
              setUnreadCount(0);
              setItems((prev) =>
                prev.map((item) => ({ ...item, is_unread: false })),
              );
            })
            .catch(() => {});
        }
        if (changelogUnread > 0) {
          markChangelogRead();
        }
      }
    },
    [unreadCount, changelogUnread],
  );

  if (!isAuthenticated) return null;

  const totalUnread = unreadCount + changelogUnread;
  const allItems: DisplayItem[] = [...changelogItems, ...items];

  const getLocaleText = (obj: Record<string, string>) =>
    obj[locale] || obj["en"] || obj["zh"] || Object.values(obj)[0] || "";

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {totalUnread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
          <span className="sr-only">{t("notifications.label")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">
            {t("notifications.title")}
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {allItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("notifications.empty")}
            </div>
          ) : (
            allItems.map((item) => {
              const Icon = TYPE_ICONS[item.type] || Megaphone;
              const color = TYPE_COLORS[item.type] || "text-muted-foreground";
              const isClickable = !!item._href;
              return (
                <div
                  key={item.id}
                  className={`flex gap-3 border-b px-4 py-3 last:border-b-0 ${item.is_unread ? "bg-accent/40" : ""} ${isClickable ? "cursor-pointer transition-colors hover:bg-accent/60" : ""}`}
                  onClick={
                    isClickable
                      ? () => {
                          setOpen(false);
                          router.push(item._href!);
                        }
                      : undefined
                  }
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {getLocaleText(item.title)}
                    </p>
                    {getLocaleText(item.content) && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {getLocaleText(item.content)}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      {timeAgo(item.published_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

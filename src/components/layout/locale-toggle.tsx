"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile } from "@/lib/api/auth";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/locales";

export function LocaleToggle() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [saving, setSaving] = useState(false);

  const nextLocale: Locale =
    SUPPORTED_LOCALES[(SUPPORTED_LOCALES.indexOf(locale as Locale) + 1) % SUPPORTED_LOCALES.length];

  const handleToggle = async () => {
    setSaving(true);
    try {
      if (isAuthenticated) {
        await updateProfile({ ui_language: nextLocale });
        await fetchUser();
      } else {
        // For non-logged-in users, set cookie and reload
        document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleToggle}
      disabled={saving}
      aria-label={`Switch to ${nextLocale === "en" ? "English" : "中文"}`}
    >
      <Globe className="h-4 w-4" />
    </Button>
  );
}

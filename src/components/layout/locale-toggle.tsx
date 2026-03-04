"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile } from "@/lib/api/auth";
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/locales";

export function LocaleToggle() {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (target: Locale) => {
    if (target === locale) return;
    setSaving(true);
    try {
      if (isAuthenticated) {
        await updateProfile({ ui_language: target });
        await fetchUser();
      } else {
        document.cookie = `NEXT_LOCALE=${target};path=/;max-age=31536000;SameSite=Lax`;
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={saving}
          aria-label={t("switchLanguage")}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleSelect(l)}
            className="gap-2"
          >
            {l === locale && <Check className="h-4 w-4" />}
            {l !== locale && <span className="w-4" />}
            {LOCALE_LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

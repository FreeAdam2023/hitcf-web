"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

interface PasswordStrengthProps {
  password: string;
}

type Strength = "weak" | "medium" | "strong";

function getStrength(password: string): Strength {
  if (!password || password.length < 8) return "weak";

  let types = 0;
  if (/[a-z]/.test(password)) types++;
  if (/[A-Z]/.test(password)) types++;
  if (/\d/.test(password)) types++;
  if (/[^a-zA-Z\d]/.test(password)) types++;

  if (types <= 1) return "weak";
  if (password.length >= 10 && types >= 3) return "strong";
  if (types >= 2) return "medium";
  return "weak";
}

const config: Record<Strength, { segments: number; color: string }> = {
  weak: { segments: 1, color: "bg-red-500" },
  medium: { segments: 2, color: "bg-amber-500" },
  strong: { segments: 3, color: "bg-green-500" },
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const t = useTranslations();
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  const { segments, color } = config[strength];
  const labelKey = `auth.register.strength${strength.charAt(0).toUpperCase() + strength.slice(1)}` as const;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= segments ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs ${
          strength === "weak"
            ? "text-red-500"
            : strength === "medium"
              ? "text-amber-500"
              : "text-green-500"
        }`}
      >
        {t(labelKey)}
      </p>
    </div>
  );
}

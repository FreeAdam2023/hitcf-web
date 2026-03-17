"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { GraduationCap, Home, Briefcase, Lightbulb, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PersonaFormData {
  targetLevel: string;
  occupation: string;
  hometown: string;
  currentCity: string;
  family: string;
  hobbies: string;
  immigrationReason: string;
  frenchDuration: string;
  extra: string;
}

const DEFAULT_VALUES: PersonaFormData = {
  targetLevel: "CLB7",
  occupation: "",
  hometown: "",
  currentCity: "",
  family: "",
  hobbies: "",
  immigrationReason: "",
  frenchDuration: "",
  extra: "",
};

interface PresetTemplate {
  icon: React.ReactNode;
  labelKey: string;
  data: Partial<PersonaFormData>;
}

const PRESETS: PresetTemplate[] = [
  {
    icon: <GraduationCap className="h-4 w-4" />,
    labelKey: "presets.student",
    data: {
      occupation: "大学生 / Étudiant(e) universitaire",
      hometown: "上海 / Shanghai, Chine",
      currentCity: "蒙特利尔 / Montréal, Canada",
      hobbies: "读书 / Lecture, 电影 / Cinéma, 旅行 / Voyages",
      immigrationReason: "留学深造 / Études supérieures",
      frenchDuration: "2 年 / 2 ans",
    },
  },
  {
    icon: <Home className="h-4 w-4" />,
    labelKey: "presets.immigrant",
    data: {
      occupation: "会计 / Comptable",
      hometown: "上海 / Shanghai, Chine",
      currentCity: "多伦多 / Toronto, Canada",
      hobbies: "烹饪 / Cuisine, 徒步 / Randonnée, 电影 / Cinéma",
      immigrationReason: "孩子教育 / Éducation des enfants",
      frenchDuration: "1 年半 / 1 an et demi",
    },
  },
  {
    icon: <Briefcase className="h-4 w-4" />,
    labelKey: "presets.worker",
    data: {
      occupation: "软件工程师 / Ingénieur(e) logiciel",
      hometown: "北京 / Pékin, Chine",
      currentCity: "北京 / Pékin, Chine",
      hobbies: "运动 / Sport, 音乐 / Musique, 游戏 / Jeux vidéo",
      immigrationReason: "职业发展 / Développement de carrière",
      frenchDuration: "6 个月 / 6 mois",
    },
  },
];

const CLB_LEVELS = ["CLB5", "CLB6", "CLB7", "CLB8", "CLB9", "CLB10"];

const FAMILY_OPTIONS = [
  "single",
  "married",
  "marriedOneChild",
  "marriedTwoChildren",
  "divorced",
  "other",
] as const;

const HOBBY_KEYS = [
  "reading",
  "travel",
  "cooking",
  "sports",
  "music",
  "cinema",
  "photography",
  "hiking",
  "gaming",
  "painting",
  "yoga",
  "dancing",
] as const;

const IMMIGRATION_KEYS = [
  "childEducation",
  "career",
  "study",
  "quality",
  "family",
  "adventure",
] as const;

const DURATION_KEYS = [
  "3months",
  "6months",
  "1year",
  "1.5years",
  "2years",
  "3years",
] as const;

// ── Tag picker component ─────────────────────────────────────────────

function TagPicker({
  tags,
  selected,
  onChange,
  customPlaceholder,
  allowCustom = true,
}: {
  tags: { key: string; label: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
  customPlaceholder?: string;
  allowCustom?: boolean;
}) {
  const [customInput, setCustomInput] = useState("");

  const toggle = useCallback(
    (label: string) => {
      if (selected.includes(label)) {
        onChange(selected.filter((s) => s !== label));
      } else {
        onChange([...selected, label]);
      }
    },
    [selected, onChange],
  );

  const addCustom = useCallback(() => {
    const val = customInput.trim();
    if (val && !selected.includes(val)) {
      onChange([...selected, val]);
    }
    setCustomInput("");
  }, [customInput, selected, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustom();
      }
    },
    [addCustom],
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map(({ key, label }) => {
          const active = selected.includes(label);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(label)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {/* Selected custom tags (not in preset list) */}
      {selected.filter((s) => !tags.some((t) => t.label === s)).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected
            .filter((s) => !tags.some((t) => t.label === s))
            .map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-2.5 py-1 text-xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((s) => s !== tag))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
        </div>
      )}
      {allowCustom && (
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addCustom}
          placeholder={customPlaceholder}
          className="h-8 text-xs"
        />
      )}
    </div>
  );
}

// ── Single-select tag picker (for duration) ──────────────────────────

function SingleTagPicker({
  tags,
  selected,
  onChange,
}: {
  tags: { key: string; label: string }[];
  selected: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(({ key, label }) => {
        const active = selected === label;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(active ? "" : label)}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-accent"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────

interface PersonaFormProps {
  onSubmit: (data: PersonaFormData) => void;
  defaultValues?: PersonaFormData;
}

export function PersonaForm({ onSubmit, defaultValues }: PersonaFormProps) {
  const t = useTranslations("speakingScripts");
  const [form, setForm] = useState<PersonaFormData>(
    defaultValues ?? DEFAULT_VALUES,
  );

  const updateField = useCallback(
    (field: keyof PersonaFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const applyPreset = useCallback((data: Partial<PersonaFormData>) => {
    setForm((prev) => ({ ...prev, ...data }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.occupation.trim() || !form.hometown.trim()) return;
      onSubmit(form);
    },
    [form, onSubmit],
  );

  // Parse comma-separated string to/from array for tag pickers
  const hobbiesArr = form.hobbies
    ? form.hobbies.split(", ").filter(Boolean)
    : [];
  const immigrationArr = form.immigrationReason
    ? form.immigrationReason.split(", ").filter(Boolean)
    : [];

  const hobbyTags = HOBBY_KEYS.map((k) => ({
    key: k,
    label: t(`personaForm.hobbyTags.${k}`),
  }));
  const immigrationTags = IMMIGRATION_KEYS.map((k) => ({
    key: k,
    label: t(`personaForm.immigrationTags.${k}`),
  }));
  const durationTags = DURATION_KEYS.map((k) => ({
    key: k,
    label: t(`personaForm.frenchDurationTags.${k}`),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("personaForm.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("personaForm.subtitle")}
        </p>
      </CardHeader>
      <CardContent>
        {/* Tip */}
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {t("personaForm.tip")}
          </p>
        </div>

        {/* Preset templates */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">
            {t("personaForm.quickFill")}
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.labelKey}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset.data)}
                className="gap-1.5"
              >
                {preset.icon}
                {t(preset.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target level */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("personaForm.fields.targetLevel")} *
            </label>
            <div className="flex flex-wrap gap-2">
              {CLB_LEVELS.map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={form.targetLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField("targetLevel", level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("personaForm.fields.occupation")} *
            </label>
            <Input
              value={form.occupation}
              onChange={(e) => updateField("occupation", e.target.value)}
              placeholder={t("personaForm.placeholders.occupation")}
              required
            />
          </div>

          {/* Hometown + Current city */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("personaForm.fields.hometown")} *
              </label>
              <Input
                value={form.hometown}
                onChange={(e) => updateField("hometown", e.target.value)}
                placeholder={t("personaForm.placeholders.hometown")}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("personaForm.fields.currentCity")}
              </label>
              <Input
                value={form.currentCity}
                onChange={(e) => updateField("currentCity", e.target.value)}
                placeholder={t("personaForm.placeholders.currentCity")}
              />
            </div>
          </div>

          {/* Family dropdown */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("personaForm.fields.family")}
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.family}
              onChange={(e) => updateField("family", e.target.value)}
            >
              <option value="">{t("personaForm.placeholders.family")}</option>
              {FAMILY_OPTIONS.map((opt) => (
                <option key={opt} value={t(`personaForm.familyOptions.${opt}`)}>
                  {t(`personaForm.familyOptions.${opt}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Hobbies tags */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("personaForm.fields.hobbies")}
            </label>
            <p className="mb-2 text-xs text-muted-foreground">
              {t("personaForm.fields.hobbiesHint")}
            </p>
            <TagPicker
              tags={hobbyTags}
              selected={hobbiesArr}
              onChange={(arr) => updateField("hobbies", arr.join(", "))}
              customPlaceholder={t("personaForm.placeholders.customHobby")}
            />
          </div>

          {/* Immigration reason tags */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("personaForm.fields.immigrationReason")}
            </label>
            <p className="mb-2 text-xs text-muted-foreground">
              {t("personaForm.fields.immigrationHint")}
            </p>
            <TagPicker
              tags={immigrationTags}
              selected={immigrationArr}
              onChange={(arr) =>
                updateField("immigrationReason", arr.join(", "))
              }
              customPlaceholder={t("personaForm.placeholders.customReason")}
            />
          </div>

          {/* French duration tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("personaForm.fields.frenchDuration")}
            </label>
            <SingleTagPicker
              tags={durationTags}
              selected={form.frenchDuration}
              onChange={(val) => updateField("frenchDuration", val)}
            />
          </div>

          {/* Extra info */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("personaForm.fields.extra")}
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.extra}
              onChange={(e) => updateField("extra", e.target.value)}
              placeholder={t("personaForm.placeholders.extra")}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            {t("personaForm.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

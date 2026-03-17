"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { GraduationCap, Home, Briefcase, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PersonaFormData {
  targetLevel: string;
  occupation: string;
  city: string;
  family: string;
  hobbies: string;
  immigrationReason: string;
  frenchDuration: string;
  extra: string;
}

const DEFAULT_VALUES: PersonaFormData = {
  targetLevel: "CLB7",
  occupation: "",
  city: "",
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
      city: "蒙特利尔 / Montréal, Canada",
      family: "单身 / Célibataire",
      hobbies: "读书、看电影、旅行 / Lecture, cinéma, voyages",
      immigrationReason: "留学深造 / Études supérieures",
      frenchDuration: "两年 / Deux ans",
    },
  },
  {
    icon: <Home className="h-4 w-4" />,
    labelKey: "presets.immigrant",
    data: {
      occupation: "会计 / Comptable",
      city: "上海 / Shanghai, Chine",
      family: "已婚，一个孩子 / Marié(e), un enfant",
      hobbies: "烹饪、散步、看纪录片 / Cuisine, promenades, documentaires",
      immigrationReason: "为了孩子的教育 / Pour l'éducation de mon enfant",
      frenchDuration: "一年半 / Un an et demi",
    },
  },
  {
    icon: <Briefcase className="h-4 w-4" />,
    labelKey: "presets.worker",
    data: {
      occupation: "软件工程师 / Ingénieur(e) logiciel",
      city: "北京 / Pékin, Chine",
      family: "已婚 / Marié(e)",
      hobbies: "游泳、编程、音乐 / Natation, programmation, musique",
      immigrationReason: "职业发展 / Développement de carrière",
      frenchDuration: "八个月 / Huit mois",
    },
  },
];

const CLB_LEVELS = ["CLB5", "CLB6", "CLB7", "CLB8", "CLB9", "CLB10"];

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
      if (!form.occupation.trim() || !form.city.trim()) return;
      onSubmit(form);
    },
    [form, onSubmit],
  );

  const fields: {
    key: keyof PersonaFormData;
    required?: boolean;
  }[] = [
    { key: "occupation", required: true },
    { key: "city", required: true },
    { key: "family" },
    { key: "hobbies" },
    { key: "immigrationReason" },
    { key: "frenchDuration" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("personaForm.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("personaForm.subtitle")}
        </p>
      </CardHeader>
      <CardContent>
        {/* Tip: no need for real info */}
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {t("personaForm.tip")}
          </p>
        </div>

        {/* Preset templates */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">{t("personaForm.quickFill")}</p>
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

          {/* Form fields */}
          {fields.map(({ key, required }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium">
                {t(`personaForm.fields.${key}`)}
                {required && " *"}
              </label>
              <Input
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={t(`personaForm.placeholders.${key}`)}
                required={required}
              />
            </div>
          ))}

          {/* Extra info textarea */}
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

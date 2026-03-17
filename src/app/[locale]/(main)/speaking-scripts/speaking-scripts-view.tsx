"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  listSpeakingScripts,
  generateSpeakingScript,
  type SpeakingScriptResponse,
  type GenerateScriptRequest,
} from "@/lib/api/speaking-scripts";
import { PersonaForm, type PersonaFormData } from "./persona-form";
import { ScriptDisplay } from "./script-display";

type ViewMode = "loading" | "form" | "generating" | "display";

const GENERATING_STEPS = [
  "generatingStep1",
  "generatingStep2",
  "generatingStep3",
  "generatingStep4",
] as const;

function GeneratingAnimation({
  t,
}: {
  t: (key: string) => string;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Cycle through steps every 8s
    const stepTimer = setInterval(() => {
      setStepIdx((prev) => Math.min(prev + 1, GENERATING_STEPS.length - 1));
    }, 8000);

    // Smooth progress bar (fake, reaches ~90% then slows)
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 70) return prev + 1.5;
        if (prev < 90) return prev + 0.3;
        return prev;
      });
    }, 300);

    return () => {
      clearInterval(stepTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-6">
      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      {/* Main text */}
      <p className="text-sm font-medium">{t("generating")}</p>

      {/* Progress bar */}
      <div className="w-64 overflow-hidden rounded-full bg-muted">
        <div
          className="h-1.5 rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step hint */}
      <p className="text-xs text-muted-foreground animate-pulse">
        {t(GENERATING_STEPS[stepIdx])}
      </p>
    </div>
  );
}

export function SpeakingScriptsView() {
  const t = useTranslations("speakingScripts");
  const tc = useTranslations("common");
  const [mode, setMode] = useState<ViewMode>("loading");
  const [script, setScript] = useState<SpeakingScriptResponse | null>(null);
  const [savedPersona, setSavedPersona] = useState<PersonaFormData | null>(null);

  // Load existing scripts on mount
  useEffect(() => {
    (async () => {
      try {
        const scripts = await listSpeakingScripts();
        if (scripts.length > 0) {
          setScript(scripts[0]);
          setMode("display");
        } else {
          // Try loading persona from localStorage
          try {
            const stored = localStorage.getItem("hitcf_speaking_persona");
            if (stored) setSavedPersona(JSON.parse(stored));
          } catch {
            // ignore parse errors
          }
          setMode("form");
        }
      } catch {
        // API failed — still try localStorage
        try {
          const stored = localStorage.getItem("hitcf_speaking_persona");
          if (stored) setSavedPersona(JSON.parse(stored));
        } catch {
          // ignore
        }
        setMode("form");
      }
    })();
  }, []);

  const handleGenerate = useCallback(
    async (data: PersonaFormData) => {
      setMode("generating");
      // Save persona to localStorage
      try {
        localStorage.setItem("hitcf_speaking_persona", JSON.stringify(data));
      } catch {
        // ignore
      }
      setSavedPersona(data);

      const req: GenerateScriptRequest = {
        target_level: data.targetLevel,
        persona: {
          occupation: data.occupation,
          city: data.city,
          family: data.family,
          hobbies: data.hobbies,
          immigration_reason: data.immigrationReason,
          french_duration: data.frenchDuration,
          extra: data.extra,
        },
      };

      try {
        const result = await generateSpeakingScript(req);
        setScript(result);
        setMode("display");
        toast.success(t("generateSuccess"));
      } catch {
        toast.error(tc("errors.generic"));
        setMode("form");
      }
    },
    [t, tc],
  );

  const handleRegenerate = useCallback(() => {
    setMode("form");
  }, []);

  const handleEditPersona = useCallback(() => {
    setMode("form");
  }, []);

  if (mode === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/tests?tab=speaking">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold md:text-2xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {mode === "form" && (
        <PersonaForm
          onSubmit={handleGenerate}
          defaultValues={savedPersona ?? undefined}
        />
      )}

      {mode === "generating" && <GeneratingAnimation t={t} />}

      {mode === "display" && script && (
        <ScriptDisplay
          script={script}
          onRegenerate={handleRegenerate}
          onEditPersona={handleEditPersona}
        />
      )}
    </div>
  );
}

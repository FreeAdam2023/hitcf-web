"use client";

import { useCallback, useEffect, useState } from "react";
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

      {mode === "generating" && (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">{t("generating")}</p>
        </div>
      )}

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

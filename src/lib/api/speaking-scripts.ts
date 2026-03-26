import { get, post, put, patch, del as del_ } from "./client";

export interface ScriptExchange {
  examiner_fr: string;
  examiner_zh: string;
  examiner_en: string;
  candidate_fr: string;
  zh: string;
  en: string;
  level_tag: string;
}

export interface ScriptTopic {
  theme: string;
  exchanges: ScriptExchange[];
}

export interface SpeakingScriptResponse {
  id: string;
  target_level: string;
  persona: Record<string, string>;
  topics: ScriptTopic[];
  generation_status: "partial" | "complete" | "error";
  created_at: string;
}

export interface GenerateScriptRequest {
  target_level: string;
  persona: Record<string, string>;
}

export function generateSpeakingScript(
  body: GenerateScriptRequest,
): Promise<SpeakingScriptResponse> {
  return post<SpeakingScriptResponse>("/api/speaking-scripts/generate", body, {
    timeout: 90_000,
  });
}

export function listSpeakingScripts(): Promise<SpeakingScriptResponse[]> {
  return get<SpeakingScriptResponse[]>("/api/speaking-scripts");
}

export function getSpeakingScript(
  id: string,
): Promise<SpeakingScriptResponse> {
  return get<SpeakingScriptResponse>(`/api/speaking-scripts/${id}`);
}

export function updateScriptExchange(
  id: string,
  body: { theme: string; exchange_index: number; candidate_fr: string },
): Promise<SpeakingScriptResponse> {
  return patch<SpeakingScriptResponse>(
    `/api/speaking-scripts/${id}/exchange`,
    body,
  );
}

export function deleteSpeakingScript(id: string): Promise<{ ok: boolean }> {
  return del_<{ ok: boolean }>(`/api/speaking-scripts/${id}`);
}

// Speaking persona (server-synced, replaces localStorage)
export function getSpeakingPersona(): Promise<{ persona: Record<string, string> | null }> {
  return get("/api/user/speaking-persona");
}

export function saveSpeakingPersona(
  persona: Record<string, string> | null,
): Promise<{ persona: Record<string, string> | null }> {
  return put("/api/user/speaking-persona", { persona });
}

export async function exportScriptCSV(id: string): Promise<void> {
  const resp = await fetch(`/api/speaking-scripts/${id}/export/csv`, {
    method: "POST",
    credentials: "include",
  });
  if (!resp.ok) throw new Error("Export failed");
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `speaking-script-${id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

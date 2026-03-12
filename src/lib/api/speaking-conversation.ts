import { get, post, del } from "./client";
import type { RequestOptions } from "./client";
import type {
  PaginatedResponse,
  SpeakingConversationResponse,
  BeginConversationResponse,
  TurnResponse,
} from "./types";

export function startConversation(
  body: { test_set_id: string; question_id: string },
  options?: RequestOptions,
): Promise<SpeakingConversationResponse> {
  return post<SpeakingConversationResponse>(
    "/api/speaking-conversation/start",
    body,
    options,
  );
}

export function startTache1Conversation(
  options?: RequestOptions,
): Promise<SpeakingConversationResponse> {
  return post<SpeakingConversationResponse>(
    "/api/speaking-conversation/start-tache1",
    undefined,
    options,
  );
}

export function beginConversation(
  sessionId: string,
  options?: RequestOptions,
): Promise<BeginConversationResponse> {
  return post<BeginConversationResponse>(
    `/api/speaking-conversation/${sessionId}/begin`,
    undefined,
    { ...options, timeout: 60_000 },
  );
}

export function sendTurn(
  sessionId: string,
  body: {
    user_text: string;
    pronunciation_scores?: Record<string, number> | null;
    word_scores?: Array<{ word: string; accuracy: number; errorType: string }>;
  },
  options?: RequestOptions,
): Promise<TurnResponse> {
  return post<TurnResponse>(
    `/api/speaking-conversation/${sessionId}/turn`,
    body,
    { ...options, timeout: 60_000 },
  );
}

export function endConversation(
  sessionId: string,
  locale: string = "zh",
  options?: RequestOptions,
): Promise<SpeakingConversationResponse> {
  return post<SpeakingConversationResponse>(
    `/api/speaking-conversation/${sessionId}/end`,
    { locale },
    { ...options, timeout: 120_000 },
  );
}

export function reEvaluateConversation(
  sessionId: string,
  locale: string = "zh",
  options?: RequestOptions,
): Promise<SpeakingConversationResponse> {
  return post<SpeakingConversationResponse>(
    `/api/speaking-conversation/${sessionId}/re-evaluate`,
    { locale },
    { ...options, timeout: 120_000 },
  );
}

export function getConversation(
  sessionId: string,
  options?: RequestOptions,
): Promise<SpeakingConversationResponse> {
  return get<SpeakingConversationResponse>(
    `/api/speaking-conversation/${sessionId}`,
    options,
  );
}

export function listConversations(
  params?: { page?: number; page_size?: number; status?: string },
  options?: RequestOptions,
): Promise<PaginatedResponse<SpeakingConversationResponse>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.page_size) sp.set("page_size", String(params.page_size));
  if (params?.status) sp.set("status", params.status);
  const qs = sp.toString();
  return get<PaginatedResponse<SpeakingConversationResponse>>(
    `/api/speaking-conversation/history${qs ? `?${qs}` : ""}`,
    options,
  );
}

export function deleteConversation(
  sessionId: string,
  options?: RequestOptions,
): Promise<{ ok: boolean }> {
  return del<{ ok: boolean }>(
    `/api/speaking-conversation/${sessionId}`,
    options,
  );
}

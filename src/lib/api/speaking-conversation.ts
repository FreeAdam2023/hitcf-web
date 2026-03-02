import { get, post } from "./client";
import type { RequestOptions } from "./client";
import type {
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

export function beginConversation(
  sessionId: string,
  options?: RequestOptions,
): Promise<BeginConversationResponse> {
  return post<BeginConversationResponse>(
    `/api/speaking-conversation/${sessionId}/begin`,
    undefined,
    options,
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

export function getConversation(
  sessionId: string,
  options?: RequestOptions,
): Promise<SpeakingConversationResponse> {
  return get<SpeakingConversationResponse>(
    `/api/speaking-conversation/${sessionId}`,
    options,
  );
}

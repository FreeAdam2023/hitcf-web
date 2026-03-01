import { get } from "./client";

export interface SpeechToken {
  token: string;
  region: string;
}

export function getSpeechToken(): Promise<SpeechToken> {
  return get<SpeechToken>("/api/speech/token");
}

import { get, type RequestOptions } from "./client";

export interface SpeechToken {
  token: string;
  region: string;
}

export function getSpeechToken(options?: RequestOptions): Promise<SpeechToken> {
  return get<SpeechToken>("/api/speech/token", options);
}

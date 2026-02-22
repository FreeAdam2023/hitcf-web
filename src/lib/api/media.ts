import { get } from "./client";

export function getAudioUrl(
  questionId: string,
): Promise<{ url: string }> {
  return get<{ url: string }>(`/api/media/audio/${questionId}`);
}

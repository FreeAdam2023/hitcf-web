import { post } from "./client";

export interface ReportQuestionBody {
  issue_type: "wrong_answer" | "bad_audio" | "bad_audio_quality" | "wrong_option" | "bad_transcript" | "other";
  description?: string;
}

export interface ReportQuestionResponse {
  id: string;
  created_at: string;
}

export function reportQuestion(
  questionId: string,
  body: ReportQuestionBody,
): Promise<ReportQuestionResponse> {
  return post<ReportQuestionResponse>(
    `/api/questions/${questionId}/report`,
    body,
  );
}

export interface ReportVocabBody {
  issue_type: "english_audio" | "wrong_definition" | "not_a_word" | "bad_example" | "other";
  description?: string;
}

export function reportVocab(
  word: string,
  body: ReportVocabBody,
): Promise<{ id: string; created_at: string }> {
  return post(`/api/vocabulary/${encodeURIComponent(word)}/report`, body);
}

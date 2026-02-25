import { post } from "./client";

export interface ReportQuestionBody {
  issue_type: "wrong_answer" | "bad_audio" | "wrong_option" | "other";
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

import { post } from "./client";

export interface SubmitFeedbackBody {
  category: "bug" | "feature" | "content" | "other";
  content: string;
  page_url?: string;
}

export interface SubmitFeedbackResponse {
  id: string;
  created_at: string;
}

export function submitFeedback(
  body: SubmitFeedbackBody,
): Promise<SubmitFeedbackResponse> {
  return post<SubmitFeedbackResponse>("/api/feedback", body);
}

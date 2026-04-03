import { get, put } from "./client";
import type { RequestOptions } from "./client";
import type { UserResponse } from "./types";

export function fetchMe(options?: RequestOptions): Promise<UserResponse> {
  return get<UserResponse>("/api/user/me", { noRedirect: true, ...options });
}

export function updateProfile(body: { name?: string; ui_language?: string }): Promise<{ message: string; name: string; ui_language: string }> {
  return put<{ message: string; name: string; ui_language: string }>("/api/user/me", body);
}

export function setExamDate(exam_date: string | null, exam_city?: string | null): Promise<{ exam_date: string | null; exam_city: string | null }> {
  return put<{ exam_date: string | null; exam_city: string | null }>("/api/user/exam-date", { exam_date, exam_city: exam_city ?? null });
}

export function changePassword(body: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  return put<{ message: string }>("/api/user/password", body);
}

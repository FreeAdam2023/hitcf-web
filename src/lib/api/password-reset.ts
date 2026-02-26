import { post } from "./client";

export interface SendCodeResponse {
  message: string;
  code?: string;
}

export interface VerifyCodeResponse {
  verification_token: string;
}

export interface ResetResponse {
  message: string;
}

export function sendResetCode(email: string): Promise<SendCodeResponse> {
  return post<SendCodeResponse>("/api/password-reset/send-code", { email });
}

export function verifyResetCode(
  email: string,
  code: string,
): Promise<VerifyCodeResponse> {
  return post<VerifyCodeResponse>("/api/password-reset/verify-code", {
    email,
    code,
  });
}

export function resetPassword(
  verification_token: string,
  password: string,
): Promise<ResetResponse> {
  return post<ResetResponse>("/api/password-reset/complete", {
    verification_token,
    password,
  });
}

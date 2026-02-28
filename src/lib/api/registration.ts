import { post } from "./client";

export interface SendCodeResponse {
  message: string;
  code?: string; // only in dev mode
}

export interface VerifyCodeResponse {
  verification_token: string;
}

export interface CompleteResponse {
  message: string;
  user: { id: string; email: string; name: string };
}

export interface RegisterResponse {
  message: string;
  code?: string; // only in dev mode
}

export interface VerifyAndCompleteResponse {
  message: string;
  user: { id: string; email: string };
}

// Legacy 3-step flow (kept for forgot-password which reuses sendCode)
export function sendCode(email: string): Promise<SendCodeResponse> {
  return post<SendCodeResponse>("/api/registration/send-code", { email });
}

export function verifyCode(
  email: string,
  code: string,
): Promise<VerifyCodeResponse> {
  return post<VerifyCodeResponse>("/api/registration/verify-code", {
    email,
    code,
  });
}

export function completeRegistration(
  verification_token: string,
  password: string,
  name: string,
): Promise<CompleteResponse> {
  return post<CompleteResponse>("/api/registration/complete", {
    verification_token,
    password,
    name,
  });
}

// New 2-step flow
export function register(
  email: string,
  password: string,
): Promise<RegisterResponse> {
  return post<RegisterResponse>("/api/registration/register", {
    email,
    password,
  });
}

export function verifyAndComplete(
  email: string,
  code: string,
): Promise<VerifyAndCompleteResponse> {
  return post<VerifyAndCompleteResponse>(
    "/api/registration/verify-and-complete",
    { email, code },
  );
}

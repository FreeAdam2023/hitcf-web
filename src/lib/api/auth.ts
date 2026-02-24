import { get, post } from "./client";
import type { RequestOptions } from "./client";
import type { UserResponse } from "./types";

export function fetchMe(options?: RequestOptions): Promise<UserResponse> {
  return get<UserResponse>("/api/auth/me", options);
}

export function logout(): Promise<{ message: string }> {
  return post<{ message: string }>("/api/auth/logout");
}

import { get, post } from "./client";
import type { UserResponse } from "./types";

export function fetchMe(): Promise<UserResponse> {
  return get<UserResponse>("/api/auth/me");
}

export function logout(): Promise<{ message: string }> {
  return post<{ message: string }>("/api/auth/logout");
}

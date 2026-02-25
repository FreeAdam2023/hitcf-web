import { get, put } from "./client";
import type { RequestOptions } from "./client";
import type { UserResponse } from "./types";

export function fetchMe(options?: RequestOptions): Promise<UserResponse> {
  return get<UserResponse>("/api/user/me", options);
}

export function updateProfile(body: { name?: string }): Promise<{ message: string; name: string }> {
  return put<{ message: string; name: string }>("/api/user/me", body);
}

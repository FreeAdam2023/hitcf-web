import { create } from "zustand";
import type { UserResponse } from "@/lib/api/types";
import { fetchMe } from "@/lib/api/auth";

let _fetchController: AbortController | null = null;

interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
  hasActiveSubscription: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    // Abort previous in-flight request
    _fetchController?.abort();
    const controller = new AbortController();
    _fetchController = controller;

    try {
      set({ isLoading: true });
      const user = await fetchMe({ signal: controller.signal });
      if (controller.signal.aborted) return;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false });
    // Dynamic import to avoid SSR issues with next-auth/react context
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/login" });
  },

  reset: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  hasActiveSubscription: () => {
    const { user } = get();
    const sub = user?.subscription;
    if (!sub) return false;
    if (sub.status === "active") return true;
    if (sub.status === "trialing") {
      if (sub.trial_end && new Date(sub.trial_end) < new Date()) return false;
      return true;
    }
    return false;
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === "admin";
  },
}));

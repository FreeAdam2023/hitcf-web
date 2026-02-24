import { create } from "zustand";
import type { UserResponse } from "@/lib/api/types";
import { fetchMe, logout as apiLogout } from "@/lib/api/auth";

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
    try {
      await apiLogout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  reset: () => set({ user: null, isAuthenticated: false, isLoading: true }),

  hasActiveSubscription: () => {
    const { user } = get();
    const status = user?.subscription?.status;
    return status === "active" || status === "trialing";
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === "admin";
  },
}));

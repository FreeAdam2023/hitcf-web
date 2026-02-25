"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

function AuthInit() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthInit />
      {children}
    </SessionProvider>
  );
}

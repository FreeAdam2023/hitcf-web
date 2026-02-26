"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

function AuthInit() {
  const { status } = useSession();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const reset = useAuthStore((s) => s.reset);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUser();
    } else if (status === "unauthenticated") {
      reset();
    }
  }, [status, fetchUser, reset]);

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

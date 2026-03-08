"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootNotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/en");
  }, [router]);

  return (
    <html lang="zh-CN">
      <body style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
        <p>Redirecting...</p>
      </body>
    </html>
  );
}

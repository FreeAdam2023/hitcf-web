"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { SpeakingConversationView } from "./speaking-conversation-view";

export default function SpeakingConversationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SpeakingConversationView />
    </Suspense>
  );
}

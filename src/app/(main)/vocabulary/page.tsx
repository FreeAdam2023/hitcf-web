import type { Metadata } from "next";
import { VocabularyView } from "./vocabulary-view";

export const metadata: Metadata = {
  title: "生词本 | HiTCF",
};

export default function VocabularyPage() {
  return <VocabularyView />;
}

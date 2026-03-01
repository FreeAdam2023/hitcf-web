import type { Metadata } from "next";
import { SavedWordsView } from "./saved-words-view";

export const metadata: Metadata = {
  title: "我的收藏 | HiTCF",
};

export default function MySavedPage() {
  return <SavedWordsView />;
}

import type { Metadata } from "next";
import { NihaoWordsView } from "./nihao-words-view";

export const metadata: Metadata = {
  title: "你好法语 | HiTCF",
};

export default function NihaoFrenchPage() {
  return <NihaoWordsView />;
}

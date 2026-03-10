import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Writing Exam | HiTCF",
  description: "Full TCF Canada mock writing exam simulation with AI grading",
};

export default function WritingMockExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

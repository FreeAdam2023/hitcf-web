import { notFound } from "next/navigation";
import { QuestionDetailView } from "./question-detail-view";

interface Props {
  params: { code: string };
}

async function fetchQuestion(code: string) {
  const baseUrl =
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";
  try {
    const res = await fetch(`${baseUrl}/api/questions/by-code/${encodeURIComponent(code)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const code = params.code.toUpperCase();
  const q = await fetchQuestion(code);
  if (!q) {
    return { title: `${code} — HiTCF` };
  }
  const typeLabel = q.type === "listening" ? "听力" : "阅读";
  return {
    title: `${code} · ${typeLabel} ${q.level} — HiTCF`,
    description: q.question_text || `TCF Canada ${typeLabel} 题目 ${code}`,
  };
}

export default async function QuestionByCodePage({ params }: Props) {
  const code = params.code.toUpperCase();
  const q = await fetchQuestion(code);
  if (!q) notFound();
  return <QuestionDetailView question={q} code={code} />;
}

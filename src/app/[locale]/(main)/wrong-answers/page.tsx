import { redirect } from "next/navigation";

export default async function WrongAnswersRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/review`);
}
